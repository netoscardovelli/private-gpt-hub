import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MessageBubble from './chat/MessageBubble';
import ChatHeader from './chat/ChatHeader';
import ChatInput from './chat/ChatInput';
import LoadingMessage from './chat/LoadingMessage';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: { name: string; plan: string; dailyLimit: number; usageToday: number };
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
    toast({
      title: "Conversa resetada",
      description: "Nova conversa iniciada com sucesso.",
    });
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'analise') {
      const message = 'Quero fazer análise de fórmulas magistrais';
      // Ao invés de setar no input, enviar diretamente
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // Simular resposta do assistente
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
    } else if (action === 'sugestao') {
      // Start the suggestion flow with the first question
      const userMessage: Message = {
        id: Date.now().toString(),
        content: 'Preciso de sugestões de fórmulas magistrais',
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // Add first question automatically
      setTimeout(() => {
        const firstQuestion: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Qual é o objetivo terapêutico da formulação que você deseja? (Ex: anti-idade, clareamento, hidratação, tratamento de acne, etc.)',
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, firstQuestion]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check usage limits
    if (user.usageToday >= user.dailyLimit) {
      toast({
        title: "Limite diário atingido",
        description: `Você atingiu o limite de ${user.dailyLimit} mensagens por dia. Faça upgrade do seu plano para continuar.`,
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
      console.log('Enviando mensagem para chat-ai...');
      
      // Carregar ativos personalizados do localStorage
      const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
      
      // Preparar histórico da conversa para contexto
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Dados a serem enviados:', {
        message: currentInput,
        historyLength: conversationHistory.length,
        customActivesLength: customActives.length
      });

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: currentInput,
          conversationHistory: conversationHistory,
          customActives: customActives
        }
      });

      console.log('Resposta recebida:', { data, error });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message || 'Erro ao conectar com a API');
      }

      if (data?.error) {
        console.error('Erro na resposta:', data);
        throw new Error(data.details || data.error);
      }

      if (!data?.response) {
        throw new Error('Resposta vazia do servidor');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Mostrar informações de uso se disponível
      if (data.usage) {
        console.log('Tokens utilizados:', data.usage);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚫 Desculpe, ocorreu um erro ao processar sua mensagem. 

Por favor, tente novamente em alguns instantes.

Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro na análise",
        description: "Não foi possível processar sua fórmula. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const remainingMessages = user.dailyLimit - user.usageToday;

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <ChatHeader user={user} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            index={index}
            onQuickAction={handleQuickAction}
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
      />
    </div>
  );
};

export default ChatInterface;
