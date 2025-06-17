
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import QuickActionButtons from './QuickActionButtons';
import FormulaSuggestionButtons from './FormulaSuggestionButtons';
import ActiveSuggestions from './ActiveSuggestions';
import QuickActiveAdder from './QuickActiveAdder';
import { detectFormulaAnalysis } from './FormulaDetection';

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

const MessageBubble = ({ 
  message, 
  index, 
  onQuickAction, 
  onAddActiveToFormula,
  userId 
}: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [showQuickActiveAdder, setShowQuickActiveAdder] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado!",
        description: "Mensagem copiada para a área de transferência",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive"
      });
    }
  };

  const handleAddActiveFromAdder = (actives: any[]) => {
    onAddActiveToFormula(actives);
    setShowQuickActiveAdder(false);
  };

  const hasQuickActions = message.content.includes('<quick-action>');
  const isFormulaAnalysis = detectFormulaAnalysis(message);
  
  // Conteúdo limpo sem quick actions para exibição
  const cleanContent = message.content.replace(/<quick-action>.*?<\/quick-action>/g, '');

  console.log('💬 MessageBubble renderizado:', {
    messageId: message.id,
    role: message.role,
    hasQuickActions,
    isFormulaAnalysis,
    showFormulaSuggestionButtons: message.role === 'assistant' && isFormulaAnalysis
  });

  // Se está mostrando o QuickActiveAdder, renderizar apenas ele
  if (showQuickActiveAdder) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%]">
          <QuickActiveAdder
            onAddActive={handleAddActiveFromAdder}
            currentFormula={message.content}
            specialty="geral"
          />
          <div className="mt-2">
            <Button
              onClick={() => setShowQuickActiveAdder(false)}
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-800"
            >
              ← Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-[85%] p-4 ${
        message.role === 'user' 
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none' 
          : 'bg-white border-emerald-200 text-emerald-900 shadow-sm'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.role === 'user' 
              ? 'bg-white/20' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
          }`}>
            {message.role === 'user' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="whitespace-pre-wrap">
              {cleanContent}
            </div>
            
            {/* Quick Action Buttons */}
            {message.role === 'assistant' && hasQuickActions && (
              <QuickActionButtons 
                content={message.content}
                onQuickAction={onQuickAction}
              />
            )}

            {/* Active Suggestions - Sugestões inteligentes baseadas em evidência */}
            {message.role === 'assistant' && isFormulaAnalysis && (
              <ActiveSuggestions
                onAddActiveToFormula={onAddActiveToFormula}
                messageContent={message.content}
                userId={userId}
              />
            )}

            {/* Formula Suggestion Buttons - Com botão "Ativos Esquecidos" */}
            {message.role === 'assistant' && isFormulaAnalysis && (
              <FormulaSuggestionButtons 
                onQuickAction={onQuickAction}
                onAddActiveToFormula={onAddActiveToFormula}
                onShowQuickActiveAdder={() => setShowQuickActiveAdder(true)}
              />
            )}

            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${message.role === 'user' ? 'opacity-70' : 'text-emerald-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="ghost"
                  className={`text-xs hover:opacity-100 ${message.role === 'user' ? 'opacity-70 text-white hover:text-white' : 'text-emerald-500 hover:text-emerald-700'}`}
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessageBubble;
