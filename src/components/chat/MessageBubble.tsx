
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import QuickActionButtons from './QuickActionButtons';
import FormulaSuggestionButtons from './FormulaSuggestionButtons';
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

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-[85%] p-4 ${
        message.role === 'user' 
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none' 
          : 'bg-slate-800 border-slate-700 text-slate-100'
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

            {/* Formula Suggestion Buttons - Forçar exibição para teste */}
            {message.role === 'assistant' && isFormulaAnalysis && (
              <div>
                <div className="text-xs text-green-400 mb-2">
                  🟢 Botões de sugestão detectados e carregando...
                </div>
                <FormulaSuggestionButtons 
                  onQuickAction={onQuickAction}
                  onAddActiveToFormula={onAddActiveToFormula}
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="ghost"
                  className="text-xs opacity-70 hover:opacity-100"
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
