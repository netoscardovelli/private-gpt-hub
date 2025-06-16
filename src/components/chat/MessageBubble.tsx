
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, ThumbsUp, ThumbsDown, FlaskConical, User, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeedbackPanel from './FeedbackPanel';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  index: number;
  onQuickAction: (action: string) => void;
  userId?: string;
}

const MessageBubble = ({ message, index, onQuickAction, userId }: MessageBubbleProps) => {
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
    });
  };

  const handleFeedbackClick = () => {
    setShowFeedback(true);
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                  onClick={() => onQuickAction('analise')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs sm:text-sm px-3 py-2 h-auto"
                  size="sm"
                >
                  🧪 Análise de Fórmulas
                </Button>
                <Button
                  onClick={() => onQuickAction('sugestao')}
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
                    title="Copiar análise"
                  >
                    <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFeedbackClick}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-400 hover:text-blue-400"
                    title="Ensinar o sistema"
                  >
                    <MessageSquarePlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-400 hover:text-green-400"
                    title="Curtir análise"
                  >
                    <ThumbsUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-slate-400 hover:text-red-400"
                    title="Não curtir análise"
                  >
                    <ThumbsDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Painel de feedback */}
        {showFeedback && message.role === 'assistant' && (
          <FeedbackPanel
            messageId={message.id}
            originalAnalysis={message.content}
            userId={userId}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </Card>
    </div>
  );
};

export default MessageBubble;
