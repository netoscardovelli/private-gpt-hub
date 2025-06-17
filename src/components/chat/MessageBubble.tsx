
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ThumbsUp, ThumbsDown, Lightbulb, MessageSquare, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ActiveSuggestions from './ActiveSuggestions';
import FeedbackPanel from './FeedbackPanel';
import PharmacySafetyAlert from './PharmacySafetyAlert';

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
  onAddActiveToFormula: (actives: any[]) => void;
  userId: string;
}

const MessageBubble = ({ message, index, onQuickAction, onAddActiveToFormula, userId }: MessageBubbleProps) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isRequestingSuggestions, setIsRequestingSuggestions] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive"
      });
    }
  };

  const handleFeedback = async (rating: number, feedback: string) => {
    try {
      await supabase.functions.invoke('chat-ai', {
        body: {
          feedback,
          originalAnalysis: message.content,
          rating,
          userId
        }
      });

      setFeedbackSent(true);
      setShowFeedback(false);
      
      toast({
        title: "Feedback enviado!",
        description: "Obrigado por ajudar a melhorar nossas análises.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const handleRequestSuggestions = async () => {
    setIsRequestingSuggestions(true);
    await onQuickAction('suggest-improvements');
    setIsRequestingSuggestions(false);
  };

  const isAnalysisMessage = message.role === 'assistant' && 
    (message.content.includes('Fórmula') || message.content.includes('• ') || message.content.includes('Composição:'));

  const hasActivesList = message.content.includes('• ') && message.content.includes('mg');

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-4xl ${message.role === 'user' ? 'bg-emerald-700' : 'bg-slate-700'} rounded-lg p-4 shadow-lg`}>
        {/* Header com ícone e timestamp */}
        <div className="flex items-center gap-2 mb-2">
          {message.role === 'user' ? (
            <User className="w-4 h-4 text-emerald-200" />
          ) : (
            <Bot className="w-4 h-4 text-blue-400" />
          )}
          <span className="text-xs text-slate-300">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>

        {/* Conteúdo da mensagem */}
        <div className={`prose prose-sm max-w-none ${
          message.role === 'user' ? 'text-emerald-50' : 'text-slate-100'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Análise de Segurança Farmacêutica - apenas para mensagens do assistente com listas de ativos */}
        {message.role === 'assistant' && hasActivesList && (
          <PharmacySafetyAlert messageContent={message.content} />
        )}

        {/* Sugestões de ativos - apenas para análises */}
        {isAnalysisMessage && (
          <ActiveSuggestions
            messageId={message.id}
            messageContent={message.content}
            onRequestSuggestions={handleRequestSuggestions}
            onAddActiveToFormula={onAddActiveToFormula}
            isLoading={isRequestingSuggestions}
            specialty="endocrinologia"
          />
        )}

        {/* Ações da mensagem */}
        {message.role === 'assistant' && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-600">
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-600 h-8 px-3"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>

            {!feedbackSent && (
              <>
                <Button
                  onClick={() => setShowFeedback(true)}
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-green-300 hover:bg-slate-600 h-8 px-3"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Útil
                </Button>
                <Button
                  onClick={() => setShowFeedback(true)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-slate-600 h-8 px-3"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Melhorar
                </Button>
              </>
            )}

            {feedbackSent && (
              <Badge className="bg-green-600/30 text-green-300 text-xs">
                Feedback enviado
              </Badge>
            )}

            {/* Quick Actions */}
            {index === 0 && (
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={() => onQuickAction('analise')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs px-3 py-1 h-auto"
                  size="sm"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Analisar Fórmulas
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Panel de feedback */}
        {showFeedback && (
          <FeedbackPanel
            onSubmit={handleFeedback}
            onCancel={() => setShowFeedback(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
