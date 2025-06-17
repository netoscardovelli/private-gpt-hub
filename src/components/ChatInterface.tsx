import { useState, useRef, useEffect } from 'react';
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

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: { id: string; name: string; plan: string; dailyLimit: number; usageToday: number };
}

const ChatInterface = ({ user }: ChatInterfaceProps) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('geral');

  const getInitialMessages = (): Message[] => [
    {
      id: '1',
      content: `Olá ${user.name}! Sou seu assistente especializado em análise de fórmulas de manipulação farmacêutica.

Escolha uma das opções abaixo para começar:

<quick-action>analise</quick-action>

<quick-action>formulas-cadastradas</quick-action>

<quick-action>sugestao-formulas</quick-action>`,
      role: 'assistant',
      timestamp: new Date()
    }
  ];

  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationMode, setConversationMode] = useState<'initial' | 'analysis'>('initial');
  const [showRegisteredFormulas, setShowRegisteredFormulas] = useState(false);
  const [showFormulaSuggestions, setShowFormulaSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetConversation = () => {
    setMessages(getInitialMessages());
    setInput('');
    setConversationMode('initial');
    setShowRegisteredFormulas(false);
    setShowFormulaSuggestions(false);
    toast({
      title: "Conversa resetada",
      description: "Nova conversa iniciada com sucesso.",
    });
  };

  // Função para extrair fórmulas automaticamente da conversa
  const extractFormulasFromConversation = (): string => {
    const formulaMessages = messages
      .filter(msg => msg.role === 'assistant')
      .filter(msg => 
        msg.content.includes('**Composição') || 
        msg.content.includes('• ') && msg.content.includes('mg') ||
        msg.content.includes('Análise da Fórmula')
      );

    if (formulaMessages.length === 0) {
      return '';
    }

    // Pegar a última análise de fórmula
    const lastFormulaAnalysis = formulaMessages[formulaMessages.length - 1];
    
    // Extrair informações relevantes
    const lines = lastFormulaAnalysis.content.split('\n');
    const formulaData = [];
    
    let currentFormula = '';
    let isComposition = false;
    
    for (const line of lines) {
      if (line.includes('**Composição') || line.includes('**COMPOSIÇÃO')) {
        isComposition = true;
        continue;
      }
      
      if (line.includes('**') && !line.includes('Composição') && !line.includes('COMPOSIÇÃO')) {
        isComposition = false;
      }
      
      if (isComposition && line.trim().startsWith('•')) {
        currentFormula += line.trim() + '\n';
      }
    }
    
    return currentFormula || lastFormulaAnalysis.content;
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'analise') {
      const message = 'Quero fazer análise de fórmulas magistrais';

      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setConversationMode('analysis');

      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Perfeito! Cole suas fórmulas aqui e eu farei uma análise completa, incluindo:\n\n• Compatibilidade entre ativos\n• Concentrações adequadas\n• Possíveis incompatibilidades\n• Sugestões de melhorias\n• Observações técnicas importantes\n\nCole sua fórmula e vamos começar!',
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
        setIsLoading(false);
      }, 1000);
    }

    if (action === 'formulas-cadastradas') {
      setShowRegisteredFormulas(true);
    }

    if (action === 'sugestao-formulas') {
      setShowFormulaSuggestions(true);
    }

    if (action === 'suggest-improvements') {
      // Extrair fórmulas automaticamente da conversa
      const extractedFormulas = extractFormulasFromConversation();
      
      if (!extractedFormulas) {
        toast({
          title: "Nenhuma fórmula encontrada",
          description: "Primeiro analise uma fórmula para poder receber sugestões de otimização.",
          variant: "destructive"
        });
        return;
      }

      const message = `ANÁLISE AUTOMÁTICA PARA OTIMIZAÇÃO:

FÓRMULAS IDENTIFICADAS NA CONVERSA:
${extractedFormulas}

INSTRUÇÃO ESPECIAL: Com base nas fórmulas analisadas acima, forneça sugestões específicas de otimização seguindo este formato:

## 💡 Sugestões de Otimização

### 🔬 Ativos Complementares Recomendados:
- [Nome do ativo] [Dose sugerida]
  - **Mecanismo:** [Como funciona]
  - **Sinergia:** [Como potencializa a fórmula existente]
  - **Base científica:** [Referência ou estudo]

### ⚖️ Ajustes de Dosagem:
- [Ativo da fórmula]: [Nova dose sugerida] (atualmente: [dose atual])
  - **Justificativa:** [Por que esta dose é melhor]

### 🧬 Combinações Sinérgicas:
- [Combinação de ativos]: [Explicação do efeito sinérgico]

### ⚠️ Considerações Importantes:
- [Observações sobre segurança, interações, etc.]

Forneça pelo menos 3-5 sugestões concretas e específicas baseadas nas fórmulas analisadas.`;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: 'Sugestões automáticas de otimização baseadas nas fórmulas analisadas',
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

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

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error: any) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `🚫 Ocorreu um erro ao gerar sugestões. Tente novamente.\n\nErro: ${error.message}`,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);

        toast({
          title: "Erro ao gerar sugestões",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddActiveToFormula = async (actives: any[]) => {
    // Get the last assistant message that contains formulas
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'assistant')
      .reverse()
      .find(msg => msg.content.includes('• ') && msg.content.includes('mg'));

    if (!lastAssistantMessage) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar uma análise de fórmula recente.",
        variant: "destructive"
      });
      return;
    }

    const activesText = actives.map(active => 
      `- ${active.name} ${active.concentration}\n  Benefício: ${active.benefit}\n  Mecanismo: ${active.mechanism}`
    ).join('\n\n');

    const enhancedMessage = `Com base na análise anterior, inclua os seguintes ativos nas fórmulas e refaça a análise completa:

FÓRMULA ORIGINAL:
${lastAssistantMessage.content}

ATIVOS A INCLUIR:
${activesText}

INSTRUÇÃO: Refaça a análise das fórmulas incluindo estes novos ativos, mostrando como eles se integram com os demais componentes e potencializam os resultados. Para cada ativo, adicione-o especificamente à fórmula mencionada em sua sugestão. Use o formato padrão de análise com composição atualizada e nova explicação.`;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Incluir ${actives.length} ativo(s) nas fórmulas e reanalizar`,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚫 Ocorreu um erro ao incluir os ativos nas fórmulas. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Erro ao incluir ativos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add specific instruction for conversational formula explanations
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚫 Ocorreu um erro. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Analisar fórmula: ${formula.name}`,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚫 Ocorreu um erro ao analisar a fórmula. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Analisar sugestão: ${suggestion.name}`,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚫 Ocorreu um erro ao analisar a sugestão. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

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
