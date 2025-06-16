import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2, Copy, ThumbsUp, ThumbsDown, FlaskConical, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      setInput(message);
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

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingMessages = user.dailyLimit - user.usageToday;

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Usage indicator */}
      <div className="bg-slate-800 border-b border-slate-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300">
            <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Assistente de Manipulação Farmacêutica - Plano {user.plan}</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400">
            {remainingMessages > 0 ? (
              <span>{remainingMessages} análises restantes hoje</span>
            ) : (
              <span className="text-red-400">Limite diário atingido</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message, index) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`w-full max-w-[90%] sm:max-w-[80%] p-3 sm:p-4 ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none' 
                : 'bg-slate-800 border-slate-700 text-slate-100'
            }`}>
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-r from-emerald-500 to-green-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{message.content}</p>
                  
                  {/* Quick action buttons - only show on first assistant message */}
                  {message.role === 'assistant' && index === 0 && (
                    <div className="flex flex-col gap-2 mt-3 sm:mt-4">
                      <Button
                        onClick={() => handleQuickAction('analise')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs sm:text-sm px-3 py-2 h-auto"
                        size="sm"
                      >
                        🧪 Análise de Fórmulas
                      </Button>
                      <Button
                        onClick={() => handleQuickAction('sugestao')}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs sm:text-sm px-3 py-2 h-auto"
                        size="sm"
                      >
                        💡 Sugestão de Fórmulas
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 sm:mt-3">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-400 hover:text-slate-200"
                        >
                          <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-400 hover:text-green-400"
                        >
                          <ThumbsUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <ThumbsDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="w-full max-w-[90%] sm:max-w-[80%] p-3 sm:p-4 bg-slate-800 border-slate-700">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                  <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="text-sm">Analisando formulação...</span>
                </div>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-2 sm:p-4 bg-slate-800">
        <div className="flex space-x-2 sm:space-x-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Cole suas fórmulas para análise..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none text-sm sm:text-base min-h-[40px]"
            rows={1}
            disabled={remainingMessages <= 0}
          />
          <Button 
            onClick={resetConversation}
            variant="outline"
            className="border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 h-10 w-10 p-0 flex-shrink-0"
            title="Resetar conversa"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || remainingMessages <= 0}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-10 w-10 p-0 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {remainingMessages <= 0 && (
          <p className="text-xs sm:text-sm text-red-400 mt-2 text-center">
            Limite diário atingido. Faça upgrade do seu plano para continuar analisando formulações.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
