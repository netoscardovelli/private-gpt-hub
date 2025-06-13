
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2, ArrowLeft, MessageCircleQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface SupportChatProps {
  user: { name: string; plan: string };
  onBack: () => void;
}

const SupportChat = ({ user, onBack }: SupportChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá ${user.name}! 🤖 Sou seu assistente de suporte do Formula.AI.

Estou aqui para esclarecer suas dúvidas sobre:
❓ Como usar as funcionalidades
🔧 Problemas técnicos
💡 Dicas e melhores práticas
📋 Configurações da conta
💰 Planos e assinatura

Como posso ajudar você hoje?`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      // Preparar histórico da conversa para contexto
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('support-ai', {
        body: {
          message: userMessage.content,
          conversationHistory: conversationHistory,
          userPlan: user.plan
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao conectar com o suporte');
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

    } catch (error) {
      console.error('Erro ao enviar mensagem para suporte:', error);
      
      // Fallback para respostas locais em caso de erro
      const fallbackResponses = [
        "🤔 Entendo sua dúvida! Para questões técnicas específicas, recomendo verificar nossa documentação ou entrar em contato com o suporte técnico através do email suporte@formula.ai",
        "📚 Ótima pergunta! Nosso sistema foi projetado para ser intuitivo. Se precisar de ajuda detalhada, nossa equipe de suporte está disponível para auxiliá-lo.",
        "💡 Vou te ajudar com isso! Para problemas relacionados à conta ou assinatura, você pode acessar a seção de configurações ou entrar em contato conosco.",
        "🔧 Questões técnicas podem ser resolvidas rapidamente! Se o problema persistir, entre em contato com nosso suporte especializado."
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Modo offline",
        description: "Respondendo com informações básicas. Para suporte completo, tente novamente em alguns momentos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center space-x-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3 text-slate-300">
            <MessageCircleQuestion className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Chat de Dúvidas - Suporte IA</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[80%] p-4 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none' 
                  : 'bg-slate-800 border-slate-700 text-slate-100'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <MessageCircleQuestion className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <MessageCircleQuestion className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando sua dúvida...</span>
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
              placeholder="Digite sua dúvida sobre o sistema..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
              rows={1}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
