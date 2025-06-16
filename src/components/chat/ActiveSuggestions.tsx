
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, Lightbulb, Target, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuggestedActive {
  name: string;
  concentration: string;
  benefit: string;
  mechanism: string;
  synergyWith: string[];
  targetFormula: string;
  targetFormulaReason: string;
}

interface ActiveSuggestionsProps {
  messageId: string;
  messageContent: string;
  onRequestSuggestions: () => void;
  onAddActiveToFormula: (actives: SuggestedActive[]) => void;
  suggestions?: SuggestedActive[];
  isLoading?: boolean;
}

const ActiveSuggestions = ({ 
  messageId, 
  messageContent,
  onRequestSuggestions,
  onAddActiveToFormula,
  suggestions = [], 
  isLoading = false 
}: ActiveSuggestionsProps) => {
  const [selectedActives, setSelectedActives] = useState<Set<string>>(new Set());
  const [parsedSuggestions, setParsedSuggestions] = useState<SuggestedActive[]>([]);
  const { toast } = useToast();

  // Função para extrair sugestões do texto da análise
  const extractSuggestionsFromText = (text: string): SuggestedActive[] => {
    const suggestions: SuggestedActive[] = [];
    
    // Procurar pela seção de sugestões
    const suggestionsSection = text.match(/💡 Sugestões de Otimização:.*$/s);
    if (!suggestionsSection) return suggestions;

    const suggestionsText = suggestionsSection[0];
    
    // Regex para capturar cada sugestão
    const suggestionRegex = /- \*\*([^(]+)\(([^)]+)\)\*\* - PARA: ([^\n]+)\s+Benefício: ([^\n]+)\s+Mecanismo: ([^\n]+)\s+Sinergia com: ([^\n]+)\s+Razão: ([^\n]+)/g;
    
    let match;
    while ((match = suggestionRegex.exec(suggestionsText)) !== null) {
      const [, name, concentration, targetFormula, benefit, mechanism, synergy, reason] = match;
      
      suggestions.push({
        name: name.trim(),
        concentration: concentration.trim(),
        targetFormula: targetFormula.trim(),
        benefit: benefit.trim(),
        mechanism: mechanism.trim(),
        synergyWith: synergy.split(',').map(s => s.trim()),
        targetFormulaReason: reason.trim()
      });
    }

    return suggestions;
  };

  useEffect(() => {
    // Extrair sugestões do conteúdo da mensagem sempre que ela mudar
    const extracted = extractSuggestionsFromText(messageContent);
    setParsedSuggestions(extracted);
  }, [messageContent]);

  const handleToggleActive = (active: SuggestedActive) => {
    setSelectedActives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(active.name)) {
        newSet.delete(active.name);
      } else {
        newSet.add(active.name);
      }
      return newSet;
    });
  };

  const handleSendSelected = () => {
    if (selectedActives.size === 0) {
      toast({
        title: "Nenhum ativo selecionado",
        description: "Selecione pelo menos um ativo para incluir nas fórmulas.",
        variant: "destructive"
      });
      return;
    }

    // Filtrar apenas os ativos selecionados
    const selectedActivesData = activeSuggestions.filter(active => 
      selectedActives.has(active.name)
    );

    // Adicionar aos ativos personalizados
    const existingActives = JSON.parse(localStorage.getItem('customActives') || '[]');
    const newActives = [];

    selectedActivesData.forEach(active => {
      const alreadyExists = existingActives.some((existing: any) => 
        existing.name.toLowerCase() === active.name.toLowerCase()
      );

      if (!alreadyExists) {
        newActives.push({
          id: Date.now().toString() + Math.random(),
          name: active.name,
          concentration: active.concentration,
          conditions: active.synergyWith,
          description: `${active.benefit}. ${active.mechanism}`,
          formulationType: 'cápsula'
        });
      }
    });

    if (newActives.length > 0) {
      const updatedActives = [...existingActives, ...newActives];
      localStorage.setItem('customActives', JSON.stringify(updatedActives));
    }

    // Enviar para análise
    onAddActiveToFormula(selectedActivesData);

    // Limpar seleção
    setSelectedActives(new Set());

    toast({
      title: "Ativos incluídos!",
      description: `${selectedActivesData.length} ativo(s) foram incluídos nas fórmulas. Gerando nova análise...`,
    });
  };

  const isSelected = (activeName: string) => selectedActives.has(activeName);

  // Usar sugestões extraídas do texto se disponíveis, senão usar as passadas via props
  const activeSuggestions = parsedSuggestions.length > 0 ? parsedSuggestions : suggestions;

  if (activeSuggestions.length === 0 && !messageContent.includes('💡 Sugestões de Otimização:')) {
    return (
      <div className="mt-4">
        <Button
          onClick={onRequestSuggestions}
          disabled={isLoading}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm px-3 py-2 h-auto flex items-center gap-2"
          size="sm"
        >
          <Lightbulb className="w-3 h-3" />
          {isLoading ? 'Analisando...' : '💡 Sugerir Ativos para Otimizar'}
        </Button>
      </div>
    );
  }

  if (activeSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-slate-200">Sugestões de Otimização</h4>
        </div>
        
        {selectedActives.size > 0 && (
          <Button
            onClick={handleSendSelected}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs px-3 py-2 h-auto flex items-center gap-2"
            size="sm"
          >
            <Send className="w-3 h-3" />
            Incluir {selectedActives.size} Selecionado(s)
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {activeSuggestions.map((active, index) => (
          <Card key={index} className="bg-slate-700/50 border-slate-600 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-100 text-sm">{active.name}</span>
                  <Badge variant="outline" className="border-emerald-400 text-emerald-400 text-xs">
                    {active.concentration}
                  </Badge>
                </div>

                {/* Indicação da fórmula alvo */}
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3 h-3 text-blue-400" />
                  <Badge className="bg-blue-600/30 text-blue-300 text-xs font-medium">
                    → {active.targetFormula}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 mb-2">{active.benefit}</p>
                
                <p className="text-xs text-slate-400 mb-2">{active.mechanism}</p>

                {/* Razão pela qual vai nessa fórmula específica */}
                <p className="text-xs text-blue-300 mb-2 italic">
                  {active.targetFormulaReason}
                </p>
                
                {active.synergyWith.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {active.synergyWith.map((synergy, idx) => (
                      <Badge key={idx} className="bg-purple-600/30 text-purple-300 text-xs">
                        Sinergia: {synergy}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => handleToggleActive(active)}
                size="sm"
                className={`h-8 px-3 text-xs ${
                  isSelected(active.name)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                }`}
              >
                {isSelected(active.name) ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Selecionado
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-1" />
                    Selecionar
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActiveSuggestions;
