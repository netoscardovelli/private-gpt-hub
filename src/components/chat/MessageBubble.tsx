import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ThumbsUp, ThumbsDown, Lightbulb, MessageSquare, User, Bot, Microscope, BookOpen, Sparkles } from 'lucide-react';
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

  // Check if this is the initial welcome message
  const isInitialMessage = message.content.includes('<quick-action>analise</quick-action>') || 
    message.content.includes('Clique no botão abaixo para começar');

  // Function to render message content with quick action buttons
  const renderMessageContent = (content: string) => {
    const quickActionRegex = /<quick-action>(.*?)<\/quick-action>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = quickActionRegex.exec(content)) !== null) {
      // Add text before the quick action
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      lastIndex = quickActionRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    // Check if this content has quick actions
    const hasQuickActions = quickActionRegex.test(content);
    
    return (
      <div>
        {/* Render text content without quick actions */}
        <span className="whitespace-pre-wrap">
          {content.replace(/<quick-action>.*?<\/quick-action>/g, '')}
        </span>
        
        {/* Render quick action buttons if they exist - reduced spacing from mt-4 to mt-2 */}
        {hasQuickActions && (
          <div className="flex flex-wrap gap-3 mt-2">
            {content.includes('<quick-action>analise</quick-action>') && (
              <Button
                onClick={() => onQuickAction('analise')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <Microscope className="w-5 h-5" />
                <span>Analisar Fórmulas</span>
              </Button>
            )}
            
            {content.includes('<quick-action>formulas-cadastradas</quick-action>') && (
              <Button
                onClick={() => onQuickAction('formulas-cadastradas')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Fórmulas Cadastradas</span>
              </Button>
            )}
            
            {content.includes('<quick-action>sugestao-formulas</quick-action>') && (
              <Button
                onClick={() => onQuickAction('sugestao-formulas')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <Lightbulb className="w-5 h-5" />
                <span>Sugestão de Fórmulas</span>
              </Button>
            )}
            
            {content.includes('<quick-action>suggest-improvements</quick-action>') && (
              <Button
                onClick={() => onQuickAction('suggest-improvements')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Sugerir Melhorias</span>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderQuickActions = (content: string) => {
    const quickActionRegex = /<quick-action>(.*?)<\/quick-action>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = quickActionRegex.exec(content)) !== null) {
      // Add text before the quick action
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const action = match[1];
      let buttonText = '';
      let buttonIcon = null;
      let buttonClass = '';

      switch (action) {
        case 'analise':
          buttonText = '🔬 Analisar Fórmulas';
          buttonIcon = <Microscope className="w-4 h-4" />;
          buttonClass = 'bg-emerald-600 hover:bg-emerald-700';
          break;
        case 'formulas-cadastradas':
          buttonText = '📚 Fórmulas Cadastradas';
          buttonIcon = <BookOpen className="w-4 h-4" />;
          buttonClass = 'bg-blue-600 hover:bg-blue-700';
          break;
        case 'sugestao-formulas':
          buttonText = '💡 Sugestão de Fórmulas';
          buttonIcon = <Lightbulb className="w-4 h-4" />;
          buttonClass = 'bg-purple-600 hover:bg-purple-700';
          break;
        case 'suggest-improvements':
          buttonText = '✨ Sugerir Melhorias';
          buttonIcon = <Sparkles className="w-4 h-4" />;
          buttonClass = 'bg-amber-600 hover:bg-amber-700';
          break;
        default:
          buttonText = action;
          buttonClass = 'bg-slate-600 hover:bg-slate-700';
      }

      parts.push(
        <Button
          key={`quick-action-${match.index}`}
          onClick={() => onQuickAction(action)}
          className={`${buttonClass} text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all hover:shadow-lg flex items-center space-x-2 mb-2`}
        >
          {buttonIcon}
          <span>{buttonText}</span>
        </Button>
      );

      lastIndex = quickActionRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

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
          {renderMessageContent(message.content)}
        </div>

        {/* Análise de Segurança Farmacêutica - apenas para mensagens do assistente com listas de ativos */}
        {message.role === 'assistant' && hasActivesList && (
          <PharmacySafetyAlert messageContent={message.content} />
        )}

        {/* Sugestões de ativos - apenas para análises */}
        {isAnalysisMessage && (
          <ActiveSuggestions
            messageContent={message.content}
            onAddActiveToFormula={onAddActiveToFormula}
            userId={userId}
          />
        )}

        {/* Ações da mensagem - apenas para mensagens do assistente que NÃO são a inicial */}
        {message.role === 'assistant' && !isInitialMessage && (
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
