
import { useState } from 'react';
import { Copy, Check, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const MessageBubble = ({ message, isUser, timestamp }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast({
        title: "Texto copiado!",
        description: "O conteúdo foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  // Função para extrair e copiar apenas a fórmula
  const copyFormulaOnly = async () => {
    const formulaMatch = message.match(/\*\*Fórmula:?\*\*(.*?)(?=\*\*|$)/s);
    if (formulaMatch) {
      const formula = formulaMatch[1].trim();
      try {
        await navigator.clipboard.writeText(formula);
        toast({
          title: "Fórmula copiada!",
          description: "A fórmula foi copiada sem as explicações.",
        });
      } catch (err) {
        toast({
          title: "Erro ao copiar fórmula",
          variant: "destructive",
        });
      }
    }
  };

  // Função para extrair e copiar apenas os ativos
  const copyActivesOnly = async () => {
    const activesMatch = message.match(/\*\*Ativos:?\*\*(.*?)(?=\*\*|$)/s);
    if (activesMatch) {
      const actives = activesMatch[1].trim();
      try {
        await navigator.clipboard.writeText(actives);
        toast({
          title: "Ativos copiados!",
          description: "A lista de ativos foi copiada.",
        });
      } catch (err) {
        toast({
          title: "Erro ao copiar ativos",
          variant: "destructive",
        });
      }
    }
  };

  const hasFormula = message.includes('**Fórmula') || message.includes('**Formula');
  const hasActives = message.includes('**Ativos') || message.includes('**Ativo');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-emerald-500 text-white ml-auto'
              : 'bg-slate-800 text-white border border-slate-700'
          }`}
        >
          <div className="flex items-start gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isUser ? 'bg-white/20' : 'bg-emerald-500'
            }`}>
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-70 mb-1">
                {isUser ? 'Você' : 'Formula.AI'}
              </div>
            </div>
          </div>
          
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message}
          </div>
          
          {timestamp && (
            <div className="text-xs opacity-50 mt-2">
              {timestamp}
            </div>
          )}
          
          {!isUser && (
            <div className="flex gap-2 mt-3 pt-2 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 px-3 text-xs hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar Tudo
                  </>
                )}
              </Button>
              
              {hasFormula && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyFormulaOnly}
                  className="h-8 px-3 text-xs hover:bg-white/10"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Fórmula
                </Button>
              )}
              
              {hasActives && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyActivesOnly}
                  className="h-8 px-3 text-xs hover:bg-white/10"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Ativos
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
