
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

  const handleQuickAction = (action: string) => {
    let message = '';
    if (action === 'analise') {
      message = 'Quero fazer análise de fórmulas magistrais';
    } else if (action === 'sugestao') {
      message = 'Preciso de sugestões de fórmulas magistrais';
    }
    
    setInput(message);
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
    setInput('');
    setIsLoading(true);

    try {
      console.log('Enviando mensagem para a API...');
      
      // Preparar histórico da conversa para contexto
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: userMessage.content,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao conectar com a API');
      }

      if (data.error) {
        throw new Error(data.details || data.error);
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
        content: `Desculpe, ocorreu um erro ao processar sua mensagem: ${error.message}. Tente novamente em alguns momentos.`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro na conversa",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
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
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 text-slate-300">
            <FlaskConical className="w-5 h-5 text-emerald-400" />
            <span className="text-sm">Assistente de Manipulação Farmacêutica - Plano {user.plan}</span>
          </div>
          <div className="text-sm text-slate-400">
            {remainingMessages > 0 ? (
              <span>{remainingMessages} análises restantes hoje</span>
            ) : (
              <span className="text-red-400">Limite diário atingido</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message, index) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[80%] p-4 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none' 
                  : 'bg-slate-800 border-slate-700 text-slate-100'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-r from-emerald-500 to-green-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <FlaskConical className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Quick action buttons - only show on first assistant message */}
                    {message.role === 'assistant' && index === 0 && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                          onClick={() => handleQuickAction('analise')}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          size="sm"
                        >
                          🧪 Análise de Fórmulas
                        </Button>
                        <Button
                          onClick={() => handleQuickAction('sugestao')}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                          size="sm"
                        >
                          💡 Sugestão de Fórmulas
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-6 px-2 text-slate-400 hover:text-slate-200"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-slate-400 hover:text-green-400"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-slate-400 hover:text-red-400"
                          >
                            <ThumbsDown className="w-3 h-3" />
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
              <Card className="max-w-[80%] p-4 bg-slate-800 border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando formulação...</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4 bg-slate-800">
        <div className="container mx-auto max-w-4xl">
          <div className="flex space-x-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Cole suas fórmulas para análise..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
              rows={1}
              disabled={remainingMessages <= 0}
            />
            <Button 
              onClick={resetConversation}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500"
              title="Resetar conversa"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading || remainingMessages <= 0}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {remainingMessages <= 0 && (
            <p className="text-sm text-red-400 mt-2 text-center">
              Limite diário atingido. Faça upgrade do seu plano para continuar analisando formulações.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
