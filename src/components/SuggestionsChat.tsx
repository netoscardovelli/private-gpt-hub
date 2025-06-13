
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2, ArrowLeft, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface SuggestionsChatProps {
  user: { name: string; plan: string };
  onBack: () => void;
}

const SuggestionsChat = ({ user, onBack }: SuggestionsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá ${user.name}! 💡 Estou aqui para ouvir suas sugestões de melhoria para o sistema Formula.AI.

Compartilhe suas ideias sobre:
✨ Novas funcionalidades
🔧 Melhorias na interface
⚡ Otimizações de desempenho
📱 Recursos adicionais
🎯 Qualquer outra sugestão

Suas ideias são valiosas para tornar nossa plataforma ainda melhor!`,
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

    // Simular resposta do bot para sugestões
    setTimeout(() => {
      const responses = [
        "Excelente sugestão! 🌟 Vou encaminhar sua ideia para nossa equipe de desenvolvimento. Suas sugestões nos ajudam a priorizar melhorias que realmente importam para nossos usuários.",
        "Muito interessante! 💡 Essa funcionalidade poderia beneficiar muitos usuários. Vou documentar sua sugestão e compartilhar com o time técnico para avaliarmos a viabilidade.",
        "Ótima observação! 🎯 Melhorias na experiência do usuário são sempre bem-vindas. Sua sugestão será considerada em nossas próximas atualizações.",
        "Adorei sua ideia! ✨ Inovações como essa são o que nos motivam a continuar evoluindo. Vou garantir que sua sugestão chegue aos desenvolvedores."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      toast({
        title: "Sugestão recebida!",
        description: "Obrigado por contribuir para melhorar nosso sistema.",
      });
    }, 1500);
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
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">Sugestões de Melhoria</span>
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
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none' 
                  : 'bg-slate-800 border-slate-700 text-slate-100'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Lightbulb className="w-4 h-4 text-white" />
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando sua sugestão...</span>
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
              placeholder="Compartilhe sua sugestão para melhorar o sistema..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
              rows={1}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsChat;
