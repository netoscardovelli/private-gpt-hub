
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MessageBubble from './chat/MessageBubble';
import ChatHeader from './chat/ChatHeader';
import ChatInput from './chat/ChatInput';
import LoadingMessage from './chat/LoadingMessage';
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
  const getInitialMessages = (): Message[] => [
    {
      id: '1',
      content: `Olá ${user.name}! Sou seu assistente especializado em análise de fórmulas de manipulação farmacêutica.

Escolha uma das opções abaixo:`,
      role: 'assistant',
      timestamp: new Date()
    }
  ];

  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationMode, setConversationMode] = useState<'initial' | 'analysis' | 'suggestion'>('initial');
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
    toast({
      title: "Conversa resetada",
      description: "Nova conversa iniciada com sucesso.",
    });
  };

  const handleQuickAction = async (action: string) => {
    const message =
      action === 'analise'
        ? 'Quero fazer análise de fórmulas magistrais'
        : 'Preciso de sugestões de fórmulas magistrais';

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setConversationMode(action === 'analise' ? 'analysis' : 'suggestion');

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content:
          action === 'analise'
            ? 'Perfeito! Cole suas fórmulas aqui e eu farei uma análise completa, incluindo:\n\n• Compatibilidade entre ativos\n• Concentrações adequadas\n• Possíveis incompatibilidades\n• Sugestões de melhorias\n• Observações técnicas importantes\n\nCole sua fórmula e vamos começar!'
            : 'Qual é o objetivo terapêutico da formulação que você deseja? (Ex: anti-idade, clareamento, hidratação, tratamento de acne, etc.)',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
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

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: currentInput,
          conversationHistory,
          customActives,
          userId: user.id // Incluir ID do usuário para personalização
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

  const remainingMessages = user.dailyLimit - user.usageToday;

  const getPlaceholder = () => {
    switch (conversationMode) {
      case 'analysis':
        return 'Cole suas fórmulas para análise...';
      case 'suggestion':
        return 'Vamos falar sobre seu caso clínico...';
      default:
        return 'Digite sua mensagem...';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <ChatHeader user={user} />

      {/* Botão de exportar PDF */}
      <div className="flex justify-end px-4 pt-2">
        <button
          onClick={() => exportChatToPDF(messages)}
          className="flex items-center space-x-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar PDF</span>
        </button>
      </div>

      {/* Área das mensagens */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            index={index}
            onQuickAction={handleQuickAction}
            userId={user.id}
          />
        ))}

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
      />
    </div>
  );
};

export default ChatInterface;
