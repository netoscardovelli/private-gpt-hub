
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuggestedActive {
  name: string;
  concentration: string;
  benefit: string;
  mechanism: string;
  synergyWith: string[];
}

interface ActiveSuggestionsProps {
  messageId: string;
  onRequestSuggestions: () => void;
  onAddActiveToFormula: (active: SuggestedActive) => void;
  suggestions?: SuggestedActive[];
  isLoading?: boolean;
}

const ActiveSuggestions = ({ 
  messageId, 
  onRequestSuggestions,
  onAddActiveToFormula,
  suggestions = [], 
  isLoading = false 
}: ActiveSuggestionsProps) => {
  const [addedActives, setAddedActives] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleAddActive = (active: SuggestedActive) => {
    // Buscar ativos personalizados existentes
    const existingActives = JSON.parse(localStorage.getItem('customActives') || '[]');
    
    // Verificar se já existe
    const alreadyExists = existingActives.some((existing: any) => 
      existing.name.toLowerCase() === active.name.toLowerCase()
    );

    if (!alreadyExists) {
      // Adicionar novo ativo aos personalizados
      const newActive = {
        id: Date.now().toString(),
        name: active.name,
        concentration: active.concentration,
        conditions: active.synergyWith,
        description: `${active.benefit}. ${active.mechanism}`,
        formulationType: 'cápsula'
      };

      const updatedActives = [...existingActives, newActive];
      localStorage.setItem('customActives', JSON.stringify(updatedActives));
    }

    // Marcar como adicionado
    setAddedActives(prev => new Set([...prev, active.name]));

    // Solicitar nova análise da fórmula com o ativo incluído
    onAddActiveToFormula(active);

    toast({
      title: "Ativo adicionado!",
      description: `${active.name} foi incluído na fórmula. Gerando nova versão...`,
    });
  };

  const isAdded = (activeName: string) => addedActives.has(activeName);

  if (suggestions.length === 0) {
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

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h4 className="text-sm font-semibold text-slate-200">Sugestões de Otimização</h4>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((active, index) => (
          <Card key={index} className="bg-slate-700/50 border-slate-600 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-100 text-sm">{active.name}</span>
                  <Badge variant="outline" className="border-emerald-400 text-emerald-400 text-xs">
                    {active.concentration}
                  </Badge>
                </div>
                
                <p className="text-xs text-slate-300 mb-2">{active.benefit}</p>
                
                <p className="text-xs text-slate-400 mb-2">{active.mechanism}</p>
                
                {active.synergyWith.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {active.synergyWith.map((synergy, idx) => (
                      <Badge key={idx} className="bg-blue-600/30 text-blue-300 text-xs">
                        Sinergia: {synergy}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => handleAddActive(active)}
                disabled={isAdded(active.name)}
                size="sm"
                className={`h-8 px-3 text-xs ${
                  isAdded(active.name)
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                }`}
              >
                {isAdded(active.name) ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Adicionado
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-1" />
                    Incluir na Fórmula
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
