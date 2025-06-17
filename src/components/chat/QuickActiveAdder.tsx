
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Heart, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormulaSelector from './FormulaSelector';

interface QuickActiveAdderProps {
  onAddActive: (actives: any[]) => void;
  currentFormula: string;
  specialty: string;
}

const QuickActiveAdder = ({ onAddActive, currentFormula, specialty }: QuickActiveAdderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActive, setSelectedActive] = useState('');
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
  const { toast } = useToast();

  // Extrair fórmulas do texto da mensagem
  const extractFormulasFromText = (text: string): string[] => {
    const formulas: string[] = [];
    
    // Procurar por padrões de fórmulas numeradas
    const formulaMatches = text.match(/(?:Fórmula|Formula)\s+(\d+)[:\s-]+(.*?)(?=(?:Fórmula|Formula)\s+\d+|$)/gs);
    
    if (formulaMatches) {
      formulaMatches.forEach((match) => {
        formulas.push(match.trim());
      });
    }

    // Se não encontrou fórmulas numeradas, procurar por composições
    if (formulas.length === 0) {
      const compositionMatches = text.match(/(?:Composição|COMPOSIÇÃO):\s*\n((?:• .+\n?)+)/gi);
      compositionMatches?.forEach((match) => {
        formulas.push(match);
      });
    }

    // Se ainda não encontrou, procurar por listas de ativos com dosagens
    if (formulas.length === 0) {
      const lines = text.split('\n');
      let currentFormula = '';
      let foundActives = false;
      
      for (const line of lines) {
        if (line.includes('• ') && (line.includes('mg') || line.includes('mcg') || line.includes('ui'))) {
          currentFormula += line.trim() + '\n';
          foundActives = true;
        } else if (foundActives && line.trim() === '') {
          if (currentFormula.trim()) {
            formulas.push(currentFormula.trim());
            currentFormula = '';
            foundActives = false;
          }
        } else if (foundActives && !line.includes('• ')) {
          if (currentFormula.trim()) {
            formulas.push(currentFormula.trim());
            currentFormula = '';
            foundActives = false;
          }
        }
      }
      
      if (currentFormula.trim()) {
        formulas.push(currentFormula.trim());
      }
    }

    return formulas;
  };

  const detectedFormulas = extractFormulasFromText(currentFormula);

  // Sugestões inteligentes baseadas na especialidade
  const getSmartSuggestions = () => {
    const suggestions: { name: string; reason: string; icon: string }[] = [];
    
    const formulaLower = currentFormula.toLowerCase();
    
    if (specialty === 'endocrinologia' || formulaLower.includes('emagrecimento') || formulaLower.includes('diabetes')) {
      suggestions.push(
        { name: 'Morosil', reason: 'Queima de gordura localizada', icon: '🔥' },
        { name: 'Berberina', reason: 'Sensibilidade à insulina', icon: '🎯' },
        { name: 'Picolinato de Cromo', reason: 'Controle glicêmico', icon: '📊' }
      );
    }

    if (formulaLower.includes('fibromialgia') || formulaLower.includes('dor')) {
      suggestions.push(
        { name: 'Curcumina', reason: 'Anti-inflamatório natural', icon: '🌿' },
        { name: 'Ômega 3', reason: 'Redução da inflamação', icon: '🐟' },
        { name: 'Vitamina D3', reason: 'Modulação da dor', icon: '☀️' }
      );
    }

    return suggestions.slice(0, 4);
  };

  const handleSelectActive = (activeName: string) => {
    setSelectedActive(activeName);
    setSearchTerm(activeName);
  };

  const handleProceedWithActive = () => {
    const activeToAdd = selectedActive || searchTerm.trim();
    
    if (!activeToAdd) {
      toast({
        title: "Digite um ativo",
        description: "Digite o nome do ativo que deseja adicionar",
        variant: "destructive"
      });
      return;
    }

    // Se há fórmulas detectadas, mostrar seletor
    if (detectedFormulas.length > 0) {
      setShowFormulaSelector(true);
    } else {
      // Se não há fórmulas, adicionar diretamente
      handleAddActive(activeToAdd);
    }
  };

  const handleAddActive = (activeName: string) => {
    // Criar o objeto do ativo no formato esperado
    const newActive = {
      name: activeName,
      concentration: 'A definir',
      benefit: 'Conforme análise clínica',
      mechanism: 'Revisar literatura'
    };

    // Usar a função onAddActive que já está conectada ao sistema
    onAddActive([newActive]);
    
    toast({
      title: "Ativo adicionado!",
      description: `${activeName} será incluído na análise atual`,
    });
  };

  const handleFormulaToggle = (formula: string) => {
    setSelectedFormulas(prev => 
      prev.includes(formula) 
        ? prev.filter(f => f !== formula)
        : [...prev, formula]
    );
  };

  const handleConfirmFormulas = () => {
    const activeToAdd = selectedActive || searchTerm.trim();
    handleAddActive(activeToAdd);
    setShowFormulaSelector(false);
    setSelectedFormulas([]);
  };

  const smartSuggestions = getSmartSuggestions();

  // Se está mostrando o seletor de fórmulas
  if (showFormulaSelector) {
    return (
      <FormulaSelector
        formulas={detectedFormulas}
        selectedFormulas={selectedFormulas}
        onFormulaToggle={handleFormulaToggle}
        onConfirm={handleConfirmFormulas}
        onCancel={() => {
          setShowFormulaSelector(false);
          setSelectedFormulas([]);
        }}
        activeName={selectedActive || searchTerm.trim()}
      />
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        {/* Header com contexto */}
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Adicionar Ativo à Análise Atual
          </h4>
          {detectedFormulas.length > 0 && (
            <Badge className="bg-blue-600/30 text-blue-300 text-xs">
              {detectedFormulas.length} fórmula(s) detectada(s)
            </Badge>
          )}
        </div>

        {/* Explicação clara */}
        <div className="bg-slate-700/30 p-3 rounded-lg">
          <p className="text-xs text-slate-300">
            {detectedFormulas.length > 0 
              ? `✨ Escolha em qual das ${detectedFormulas.length} fórmula(s) detectada(s) adicionar o ativo`
              : '✨ O ativo será incluído em uma nova análise'
            }
          </p>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Digite o nome do ativo (ex: Morosil, Berberina...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleProceedWithActive()}
                className="bg-slate-700 border-slate-600 text-white pl-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sugestões Inteligentes */}
        {smartSuggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-slate-300">Sugestões para esta análise</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {smartSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  onClick={() => handleSelectActive(suggestion.name)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 text-xs h-auto p-2 justify-start"
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

        {/* Botão de continuar */}
        <Button
          onClick={handleProceedWithActive}
          disabled={!(selectedActive || searchTerm.trim())}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="sm"
        >
          <ArrowRight className="w-3 h-3 mr-1" />
          {detectedFormulas.length > 0 
            ? `Escolher onde adicionar "${selectedActive || searchTerm}"`
            : `Adicionar "${selectedActive || searchTerm}" à análise`
          }
        </Button>

        <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-700/30 p-2 rounded">
          <Clock className="w-3 h-3" />
          {detectedFormulas.length > 0 
            ? 'Você poderá escolher em qual fórmula adicionar o ativo'
            : 'O ativo será integrado automaticamente e a análise será refeita'
          }
        </div>
      </div>
    </Card>
  );
};

export default QuickActiveAdder;
