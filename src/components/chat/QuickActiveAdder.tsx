import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Heart, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormulaSelector from './FormulaSelector';

interface QuickActiveAdderProps {
  onAddActive: (active: string, concentration?: string, targetFormulas?: string[]) => void;
  currentFormula: string;
  specialty: string;
}

const QuickActiveAdder = ({ onAddActive, currentFormula, specialty }: QuickActiveAdderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);
  const [pendingActive, setPendingActive] = useState<string>('');
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
  const { toast } = useToast();

  // Extrair fórmulas do texto da mensagem
  const extractFormulasFromText = (text: string): string[] => {
    const formulas: string[] = [];
    
    // Procurar por padrões de fórmulas
    const formulaPatterns = [
      /(?:Fórmula|Formula)\s+[\d\w\s-]+:\s*\n((?:• .+\n?)+)/gi,
      /(?:Composição|COMPOSIÇÃO):\s*\n((?:• .+\n?)+)/gi,
      /\*\*(?:Fórmula|Formula)\s+[\d\w\s-]+\*\*\s*\n((?:• .+\n?)+)/gi
    ];

    formulaPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          formulas.push(match[1].trim());
        }
      }
    });

    // Se não encontrou fórmulas com padrões, procurar por listas de ativos
    if (formulas.length === 0) {
      const activeListPattern = /(?:• .+\n?){3,}/g;
      let match;
      while ((match = activeListPattern.exec(text)) !== null) {
        formulas.push(match[0].trim());
      }
    }

    return formulas.filter(f => f.length > 50); // Filtrar fórmulas muito pequenas
  };

  const availableFormulas = extractFormulasFromText(currentFormula);

  // Ativos frequentes baseados no perfil do usuário (simulado - em produção viria do backend)
  const getUserFavoriteActives = () => {
    const savedActives = JSON.parse(localStorage.getItem('customActives') || '[]');
    const savedFormulas = JSON.parse(localStorage.getItem('savedFormulas') || '[]');
    
    // Extrair ativos mais usados das fórmulas salvas
    const activesFromFormulas = savedFormulas.flatMap((formula: any) => {
      const activeMatches = formula.content?.match(/• ([^:]+):/g) || [];
      return activeMatches.map((match: string) => match.replace('• ', '').replace(':', '').trim());
    });

    // Combinar com ativos personalizados
    const allActives = [...savedActives.map((a: any) => a.name), ...activesFromFormulas];
    
    // Contar frequência
    const frequency: Record<string, number> = {};
    allActives.forEach(active => {
      frequency[active] = (frequency[active] || 0) + 1;
    });

    // Retornar os mais frequentes
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([active, count]) => ({ name: active, frequency: count }));
  };

  // Sugestões inteligentes baseadas na especialidade e fórmula atual
  const getSmartSuggestions = () => {
    const suggestions: { name: string; reason: string; icon: string }[] = [];
    
    const formulaLower = currentFormula.toLowerCase();
    
    // Sugestões por especialidade
    if (specialty === 'endocrinologia') {
      if (formulaLower.includes('emagrecimento') || formulaLower.includes('obesidade')) {
        suggestions.push(
          { name: 'Morosil', reason: 'Queima de gordura', icon: '🔥' },
          { name: 'Picolinato de Cromo', reason: 'Controle glicêmico', icon: '📊' },
          { name: 'L-Carnitina', reason: 'Metabolismo lipídico', icon: '⚡' }
        );
      }
      if (formulaLower.includes('diabetes') || formulaLower.includes('resistência')) {
        suggestions.push(
          { name: 'Berberina', reason: 'Sensibilidade insulínica', icon: '🎯' },
          { name: 'Ácido Alfa-Lipóico', reason: 'Neuropatia diabética', icon: '🛡️' }
        );
      }
    }

    if (specialty === 'dermatologia') {
      if (formulaLower.includes('acne') || formulaLower.includes('oleosidade')) {
        suggestions.push(
          { name: 'Zinco Quelato', reason: 'Anti-inflamatório', icon: '✨' },
          { name: 'Ômega 3', reason: 'Controle sebáceo', icon: '🐟' }
        );
      }
    }

    return suggestions.slice(0, 6);
  };

  const handleInitiateAddActive = (activeName: string) => {
    if (availableFormulas.length === 0) {
      // Se não há fórmulas detectadas, adicionar diretamente
      onAddActive(activeName);
      toast({
        title: "Ativo adicionado!",
        description: `${activeName} foi incluído na análise`,
      });
      return;
    }

    // Se há múltiplas fórmulas, mostrar seletor
    setPendingActive(activeName);
    setSelectedFormulas([]);
    setShowFormulaSelector(true);
  };

  const handleAddCustomActive = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Digite um ativo",
        description: "Digite o nome do ativo que deseja adicionar",
        variant: "destructive"
      });
      return;
    }

    handleInitiateAddActive(searchTerm.trim());
    setSearchTerm('');
  };

  const handleFormulaToggle = (formula: string) => {
    setSelectedFormulas(prev => 
      prev.includes(formula)
        ? prev.filter(f => f !== formula)
        : [...prev, formula]
    );
  };

  const handleConfirmAddition = () => {
    onAddActive(pendingActive, undefined, selectedFormulas);
    
    toast({
      title: "Ativo adicionado!",
      description: `${pendingActive} foi incluído em ${selectedFormulas.length} fórmula(s)`,
    });

    // Reset state
    setShowFormulaSelector(false);
    setPendingActive('');
    setSelectedFormulas([]);
  };

  const handleCancelAddition = () => {
    setShowFormulaSelector(false);
    setPendingActive('');
    setSelectedFormulas([]);
  };

  const favoriteActives = getUserFavoriteActives();
  const smartSuggestions = getSmartSuggestions();

  if (showFormulaSelector) {
    return (
      <FormulaSelector
        formulas={availableFormulas}
        selectedFormulas={selectedFormulas}
        onFormulaToggle={handleFormulaToggle}
        onConfirm={handleConfirmAddition}
        onCancel={handleCancelAddition}
        activeName={pendingActive}
      />
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Esqueceu algum ativo? Adicione aqui!
          </h4>
          {availableFormulas.length > 0 && (
            <Badge className="bg-blue-600/30 text-blue-300 text-xs">
              {availableFormulas.length} fórmula(s) detectada(s)
            </Badge>
          )}
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Digite o nome do ativo (ex: Morosil, Berberina...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomActive()}
              className="bg-slate-700 border-slate-600 text-white pl-10 text-sm"
            />
          </div>
          <Button
            onClick={handleAddCustomActive}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        </div>

        {/* Seus Ativos Favoritos */}
        {favoriteActives.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-xs font-medium text-slate-300">Seus Favoritos</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {favoriteActives.map((active, index) => (
                <Button
                  key={index}
                  onClick={() => handleInitiateAddActive(active.name)}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/20 text-xs h-7 px-2"
                >
                  <Heart className="w-2 h-2 mr-1" />
                  {active.name}
                  <Badge className="ml-1 bg-red-600/30 text-red-200 text-xs px-1 py-0">
                    {active.frequency}x
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sugestões Inteligentes */}
        {smartSuggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-slate-300">
                Sugestões para {specialty === 'endocrinologia' ? 'Endocrinologia' : specialty}
              </span>
            </div>
            <div className="space-y-1">
              {smartSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  onClick={() => handleInitiateAddActive(suggestion.name)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 text-xs h-auto p-2 w-full justify-start"
                >
                  <span className="mr-2">{suggestion.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-xs text-blue-400">{suggestion.reason}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          O sistema aprende seus padrões e sugere ativos baseado no seu histórico
        </div>
      </div>
    </Card>
  );
};

export default QuickActiveAdder;
