
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bot, Copy, Check, Lightbulb, Plus } from 'lucide-react';
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
  
  // Verificar se a mensagem contém análise de fórmula - detecção melhorada
  const isFormulaAnalysis = message.role === 'assistant' && (
    message.content.includes('**Composição') || 
    message.content.includes('Análise da Fórmula') ||
    message.content.includes('**Benefícios Gerais') ||
    message.content.includes('**Importância do Uso') ||
    message.content.includes('📚 Fundamentação Científica') ||
    message.content.includes('**Instruções de Uso') ||
    message.content.includes('Essa fórmula foi desenvolvida') ||
    message.content.includes('elaborei essa fórmula') ||
    (message.content.includes('mg') && message.content.includes('UI') && message.content.includes('mcg')) ||
    // Detectar múltiplos ativos com dosagens
    (message.content.match(/\d+\s*(mg|mcg|UI|g)/g) || []).length >= 3
  );

  console.log('🔍 Análise de detecção de fórmula:', {
    messageId: message.id,
    isFormulaAnalysis,
    contentLength: message.content.length,
    containsBeneficios: message.content.includes('**Benefícios Gerais'),
    containsFundamentacao: message.content.includes('📚 Fundamentação Científica'),
    dosageMatches: (message.content.match(/\d+\s*(mg|mcg|UI|g)/g) || []).length
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

            {/* Botões de sugestão de otimização para análises de fórmula */}
            {isFormulaAnalysis && (
              <div className="mt-4 space-y-3">
                {/* Botão de Sugestão de Otimização */}
                <div className="p-3 bg-gradient-to-r from-purple-600/20 to-emerald-600/20 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-purple-300 mb-1">
                        Quer otimizar suas fórmulas?
                      </h4>
                      <p className="text-xs text-slate-400">
                        Receba sugestões de ativos complementares baseadas na análise científica
                      </p>
                    </div>
                    <Button
                      onClick={() => handleQuickActionClick('suggest-improvements')}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white ml-3"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Sugerir Ativos
                    </Button>
                  </div>
                </div>

                {/* Botão de Ativos Esquecidos */}
                <div className="p-3 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg border border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-orange-300 mb-1">
                        Ativos esquecidos?
                      </h4>
                      <p className="text-xs text-slate-400">
                        Adicione ativos personalizados às suas fórmulas
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
                        if (customActives.length > 0) {
                          onAddActiveToFormula(customActives);
                        } else {
                          toast({
                            title: "Nenhum ativo personalizado",
                            description: "Cadastre ativos personalizados na aba 'Ativos Personalizados'",
                            variant: "destructive"
                          });
                        }
                      }}
                      size="sm"
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white ml-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
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
