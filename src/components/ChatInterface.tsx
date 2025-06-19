import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MessageBubble from './chat/MessageBubble';
import ChatHeader from './chat/ChatHeader';
import ChatInput from './chat/ChatInput';
import LoadingMessage from './chat/LoadingMessage';
import FormulaButtons from './chat/FormulaButtons';
import RegisteredFormulasPanel from './chat/RegisteredFormulasPanel';
import FormulaSuggestionsPanel from './chat/FormulaSuggestionsPanel';
import UsageMeter from './chat/UsageMeter';
import { exportChatToPDF } from '@/utils/exportToPDF';
import { Download } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useFormulaExtraction } from '@/hooks/useFormulaExtraction';
import { useQuickActions } from '@/hooks/useQuickActions';
import { useSmartLimits } from '@/hooks/useSmartLimits';
import { monitoring } from '@/services/MonitoringService';
import { intelligentCache } from '@/services/IntelligentCache';

interface ChatInterfaceProps {
  user: { id: string; name: string; plan: string; dailyLimit: number; usageToday: number };
}

const ChatInterface = ({ user }: ChatInterfaceProps) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('geral');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisteredFormulas, setShowRegisteredFormulas] = useState(false);
  const [showFormulaSuggestions, setShowFormulaSuggestions] = useState(false);
  const { toast } = useToast();

  // Initialize monitoring
  useEffect(() => {
    monitoring.setUserId(user.id);
    monitoring.trackEvent('session_started', { 
      userId: user.id,
      plan: user.plan 
    });

    return () => {
      monitoring.trackEvent('session_ended', { userId: user.id });
    };
  }, [user.id]);

  const {
    messages,
    setMessages,
    conversationMode,
    setConversationMode,
    messagesEndRef,
    addMessage,
    resetMessages
  } = useMessages(user.name);

  const { extractFormulasFromConversation } = useFormulaExtraction();

  const { 
    userTier, 
    usageStats, 
    loading: limitsLoading, 
    checkAndConsumeLimit,
    getRemainingQueries,
    canUseCache,
    getUsagePercentage
  } = useSmartLimits();

  const { handleQuickAction, handleAddActiveToFormula } = useQuickActions({
    messages,
    addMessage,
    setMessages,
    setConversationMode,
    setIsLoading,
    extractFormulasFromConversation,
    user,
    selectedSpecialty
  });

  const resetConversation = () => {
    resetMessages();
    setInput('');
    setShowRegisteredFormulas(false);
    setShowFormulaSuggestions(false);
    
    monitoring.trackEvent('conversation_reset', { userId: user.id });
    
    toast({
      title: "Conversa resetada",
      description: "Nova conversa iniciada com sucesso.",
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Verificar limites antes de processar
    const canProceed = await checkAndConsumeLimit();
    if (!canProceed) {
      return; // O hook já mostra o toast de limite
    }

    const startTime = performance.now();
    
    monitoring.trackEvent('query_submitted', {
      specialty: selectedSpecialty,
      queryLength: input.length,
      userId: user.id
    });

    addMessage({
      content: input,
      role: 'user'
    });

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      let response: string;
      let fromCache = false;
      let cacheEntry = null;

      // Tentar buscar no cache se o usuário tem acesso
      if (canUseCache()) {
        console.log('🔍 Verificando cache...');
        cacheEntry = await intelligentCache.findSimilarQuery(currentInput, selectedSpecialty);
        
        if (cacheEntry) {
          response = cacheEntry.response;
          fromCache = true;
          
          monitoring.trackEvent('cache_hit', {
            specialty: selectedSpecialty,
            cacheId: cacheEntry.id,
            hitCount: cacheEntry.hit_count
          });

          console.log('✅ Resposta obtida do cache');
        }
      }

      // Se não encontrou no cache, buscar da IA
      if (!fromCache) {
        console.log('🤖 Buscando resposta da IA...');
        
        const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const enhancedMessage = `${currentInput}

INSTRUÇÃO ESPECIAL: Ao explicar fórmulas, faça uma explicação conversacional e fluida, como se um técnico farmacêutico estivesse falando diretamente com o paciente. Cite os ativos e suas funções em um texto corrido, sem separar por tópicos ou bullets. Use uma linguagem técnica mas acessível, explicando o conjunto da fórmula de forma integrada.`;

        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: {
            message: enhancedMessage,
            conversationHistory,
            customActives,
            userId: user.id,
            specialty: selectedSpecialty
          }
        });

        if (error || data?.error || !data?.response) {
          throw new Error(data?.details || error?.message || 'Erro desconhecido');
        }

        response = data.response;

        // Salvar no cache se o usuário tem acesso
        if (canUseCache()) {
          await intelligentCache.saveResponse(
            currentInput,
            selectedSpecialty,
            response,
            {
              provider: 'openai',
              tokens: data.tokens || 0,
              processingTime: performance.now() - startTime
            }
          );
        }
      }

      const endTime = performance.now();

      // Tracking de métricas
      monitoring.trackEvent('query_completed', {
        specialty: selectedSpecialty,
        fromCache,
        responseTime: endTime - startTime,
        responseLength: response.length,
        userId: user.id
      });

      // Adicionar indicador de cache na resposta
      const responseWithIndicator = fromCache 
        ? `⚡ *Resposta do cache* (${Math.round(endTime - startTime)}ms)\n\n${response}`
        : response;

      addMessage({
        content: responseWithIndicator,
        role: 'assistant'
      });

    } catch (error: any) {
      monitoring.trackError(error, {
        context: 'chat_interface_send',
        userId: user.id,
        specialty: selectedSpecialty
      });

      addMessage({
        content: `🚫 Ocorreu um erro. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant'
      });

      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisteredFormulaSelect = async (formula: any) => {
    const message = `Analisar fórmula cadastrada: ${formula.name}

**Composição:** ${formula.composition}
${formula.indication ? `**Indicação:** ${formula.indication}` : ''}
${formula.dosage ? `**Posologia:** ${formula.dosage}` : ''}

Por favor, faça uma análise completa desta fórmula incluindo compatibilidade, dosagens e sugestões de melhoria.`;

    monitoring.trackEvent('registered_formula_selected', {
      formulaName: formula.name,
      userId: user.id
    });

    addMessage({
      content: `Analisar fórmula: ${formula.name}`,
      role: 'user'
    });

    setIsLoading(true);
    setShowRegisteredFormulas(false);

    try {
      const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message,
          conversationHistory,
          customActives,
          userId: user.id,
          specialty: selectedSpecialty
        }
      });

      if (error || data?.error || !data?.response) {
        throw new Error(data?.details || error?.message || 'Erro desconhecido');
      }

      addMessage({
        content: data.response,
        role: 'assistant'
      });
    } catch (error: any) {
      monitoring.trackError(error, {
        context: 'registered_formula_analysis',
        formulaName: formula.name
      });

      addMessage({
        content: `🚫 Ocorreu um erro ao analisar a fórmula. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant'
      });

      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormulaSuggestionSelect = async (suggestion: any) => {
    const message = `Analisar sugestão de fórmula: ${suggestion.name}

**Indicação:** ${suggestion.indication}
**Composição:** ${suggestion.composition.join(', ')}
**Descrição:** ${suggestion.description}

Por favor, faça uma análise detalhada desta fórmula incluindo mecanismo de ação, compatibilidade entre ativos e orientações de uso.`;

    addMessage({
      content: `Analisar sugestão: ${suggestion.name}`,
      role: 'user'
    });

    setIsLoading(true);
    setShowFormulaSuggestions(false);

    try {
      const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message,
          conversationHistory,
          customActives,
          userId: user.id,
          specialty: selectedSpecialty
        }
      });

      if (error || data?.error || !data?.response) {
        throw new Error(data?.details || error?.message || 'Erro desconhecido');
      }

      addMessage({
        content: data.response,
        role: 'assistant'
      });
    } catch (error: any) {
      addMessage({
        content: `🚫 Ocorreu um erro ao analisar a sugestão. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant'
      });

      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = getRemainingQueries();
  const usagePercentage = getUsagePercentage();
  const showFormulaButtons = conversationMode === 'initial';

  if (limitsLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <ChatHeader user={user} />

      <div className="flex justify-end px-4 pt-2">
        <button
          onClick={() => {
            monitoring.trackEvent('pdf_export_initiated', { userId: user.id });
            exportChatToPDF(messages);
          }}
          className="flex items-center space-x-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar PDF</span>
        </button>
      </div>

      {/* Usage Meter */}
      {userTier && usageStats && (
        <div className="px-4 pt-2">
          <UsageMeter
            userTier={userTier}
            usageStats={usageStats}
            usagePercentage={usagePercentage}
            remaining={remaining}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        <FormulaButtons 
          showButtons={showFormulaButtons}
          onShowRegisteredFormulas={() => setShowRegisteredFormulas(true)}
          onShowFormulaSuggestions={() => setShowFormulaSuggestions(true)}
        />

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message.content}
            isUser={message.role === 'user'}
            timestamp={message.timestamp.toLocaleString()}
          />
        ))}

        {showRegisteredFormulas && (
          <RegisteredFormulasPanel
            onClose={() => setShowRegisteredFormulas(false)}
            onSelectFormula={handleRegisteredFormulaSelect}
          />
        )}

        {showFormulaSuggestions && (
          <FormulaSuggestionsPanel
            onClose={() => setShowFormulaSuggestions(false)}
            onSelectSuggestion={handleFormulaSuggestionSelect}
          />
        )}

        {isLoading && <LoadingMessage />}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onReset={resetConversation}
        isLoading={isLoading}
        remainingMessages={remaining.daily}
        placeholder={getPlaceholder()}
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={setSelectedSpecialty}
      />
    </div>
  );

  function getPlaceholder() {
    switch (conversationMode) {
      case 'analysis':
        return 'Cole suas fórmulas para análise...';
      default:
        return 'Digite sua mensagem...';
    }
  }
};

export default ChatInterface;
