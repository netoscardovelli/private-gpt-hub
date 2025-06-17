
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MessageBubble from './chat/MessageBubble';
import ChatHeader from './chat/ChatHeader';
import ChatInput from './chat/ChatInput';
import LoadingMessage from './chat/LoadingMessage';
import FormulaButtons from './chat/FormulaButtons';
import RegisteredFormulasPanel from './chat/RegisteredFormulasPanel';
import FormulaSuggestionsPanel from './chat/FormulaSuggestionsPanel';
import { exportChatToPDF } from '@/utils/exportToPDF';
import { Download } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useFormulaExtraction } from '@/hooks/useFormulaExtraction';
import { useQuickActions } from '@/hooks/useQuickActions';

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
    toast({
      title: "Conversa resetada",
      description: "Nova conversa iniciada com sucesso.",
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (user.usageToday >= user.dailyLimit) {
      toast({
        title: "Limite diário atingido",
        description: `Você atingiu o limite de ${user.dailyLimit} mensagens por dia.`,
        variant: "destructive"
      });
      return;
    }

    addMessage({
      content: input,
      role: 'user'
    });

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
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

      addMessage({
        content: data.response,
        role: 'assistant'
      });
    } catch (error: any) {
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

  const remainingMessages = user.dailyLimit - user.usageToday;

  const getPlaceholder = () => {
    switch (conversationMode) {
      case 'analysis':
        return 'Cole suas fórmulas para análise...';
      default:
        return 'Digite sua mensagem...';
    }
  };

  const showFormulaButtons = conversationMode === 'initial';

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <ChatHeader user={user} />

      <div className="flex justify-end px-4 pt-2">
        <button
          onClick={() => exportChatToPDF(messages)}
          className="flex items-center space-x-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar PDF</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        <FormulaButtons 
          showButtons={showFormulaButtons}
          onShowRegisteredFormulas={() => setShowRegisteredFormulas(true)}
          onShowFormulaSuggestions={() => setShowFormulaSuggestions(true)}
        />

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            index={index}
            onQuickAction={handleQuickAction}
            onAddActiveToFormula={handleAddActiveToFormula}
            userId={user.id}
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
        remainingMessages={remainingMessages}
        placeholder={getPlaceholder()}
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={setSelectedSpecialty}
      />
    </div>
  );
};

export default ChatInterface;
