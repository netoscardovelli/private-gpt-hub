
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const handleQuickActionClick = (action: string) => {
    console.log('Quick action clicked:', action);
    onQuickAction(action);
  };

  const renderQuickActions = (content: string) => {
    const quickActionRegex = /<quick-action>(.*?)<\/quick-action>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = quickActionRegex.exec(content)) !== null) {
      // Adicionar texto antes do match
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      // Verificar se o match[1] existe antes de usar
      const actionValue = match[1];
      if (actionValue) {
        parts.push(
          <Button
            key={match.index}
            onClick={() => handleQuickActionClick(actionValue)}
            size="sm"
            className="mx-1 my-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {getActionLabel(actionValue)}
          </Button>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Adicionar texto restante
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    
    return parts;
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'analise': '🔬 Análise de Fórmulas',
      'formulas-cadastradas': '📋 Fórmulas Cadastradas',
      'sugestao-formulas': '💡 Sugestões de Fórmulas'
    };
    return labels[action] || action;
  };

  const hasQuickActions = message.content.includes('<quick-action>');

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
              {message.role === 'assistant' && hasQuickActions 
                ? renderQuickActions(message.content.replace(/<quick-action>.*?<\/quick-action>/g, ''))
                : message.content}
            </div>
            
            {message.role === 'assistant' && hasQuickActions && (
              <div className="mt-3 flex flex-wrap gap-2">
                {renderQuickActions(message.content).filter(part => 
                  typeof part === 'object' && part?.type === Button
                )}
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
