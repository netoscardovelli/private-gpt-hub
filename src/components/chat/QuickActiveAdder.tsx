
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Heart, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickActiveAdderProps {
  onAddActive: (active: string, concentration?: string, targetFormulas?: string[]) => void;
  currentFormula: string;
  specialty: string;
}

const QuickActiveAdder = ({ onAddActive, currentFormula, specialty }: QuickActiveAdderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActive, setSelectedActive] = useState('');
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | ''>('');
  const { toast } = useToast();

  // Extrair fórmulas do texto da mensagem
  const extractFormulasFromText = (text: string): { name: string; content: string }[] => {
    const formulas: { name: string; content: string }[] = [];
    
    // Procurar por padrões de fórmulas numeradas
    const formulaMatches = text.match(/(?:Fórmula|Formula)\s+(\d+)[:\s-]+(.*?)(?=(?:Fórmula|Formula)\s+\d+|$)/gs);
    
    if (formulaMatches) {
      formulaMatches.forEach((match, index) => {
        const numberMatch = match.match(/(?:Fórmula|Formula)\s+(\d+)/);
        const number = numberMatch ? numberMatch[1] : (index + 1).toString();
        
        formulas.push({
          name: `Fórmula ${number}`,
          content: match.trim()
        });
      });
    }

    // Se não encontrou fórmulas numeradas, procurar por composições
    if (formulas.length === 0) {
      const compositionMatches = text.match(/(?:Composição|COMPOSIÇÃO):\s*\n((?:• .+\n?)+)/gi);
      compositionMatches?.forEach((match, index) => {
        formulas.push({
          name: `Fórmula ${index + 1}`,
          content: match
        });
      });
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
    
    // Se há fórmulas detectadas, perguntar onde adicionar
    if (detectedFormulas.length > 0) {
      setSelectedOption('');
    } else {
      // Se não há fórmulas, adicionar diretamente
      handleAddActive(activeName, 'existing');
    }
  };

  const handleAddActive = (activeName: string, option: 'existing' | 'new') => {
    const activeToAdd = activeName || searchTerm.trim();
    
    if (!activeToAdd) {
      toast({
        title: "Digite um ativo",
        description: "Digite o nome do ativo que deseja adicionar",
        variant: "destructive"
      });
      return;
    }

    onAddActive(activeToAdd);
    
    toast({
      title: "Ativo adicionado!",
      description: option === 'existing' 
        ? `${activeToAdd} será incluído nas fórmulas existentes`
        : `${activeToAdd} será usado para criar nova fórmula`,
    });
  };

  const smartSuggestions = getSmartSuggestions();

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        {/* Header com contexto */}
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Adicionar Ativo Esquecido
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
              ? "🎯 Escolha um ativo e decida se quer incluí-lo nas fórmulas existentes ou criar uma nova fórmula"
              : "✨ Adicione um ativo que será analisado e incluído na conversa"
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
                onKeyPress={(e) => e.key === 'Enter' && handleSelectActive(searchTerm)}
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

        {/* Opções de onde adicionar (quando há fórmulas detectadas E ativo selecionado) */}
        {detectedFormulas.length > 0 && selectedActive && (
          <div className="space-y-3 border-t border-slate-600 pt-3">
            <div className="text-sm font-medium text-slate-200">
              Onde adicionar <span className="text-emerald-400">{selectedActive}</span>?
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => handleAddActive(selectedActive, 'existing')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-between"
                size="sm"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Incluir nas fórmulas existentes
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => handleAddActive(selectedActive, 'new')}
                variant="outline"
                className="w-full border-slate-500 text-slate-300 hover:bg-slate-600 justify-between"
                size="sm"
              >
                <div className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar nova fórmula com este ativo
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Botão de adicionar quando não há fórmulas detectadas ou quando digitou diretamente */}
        {(detectedFormulas.length === 0 || (!selectedActive && searchTerm)) && (
          <Button
            onClick={() => handleAddActive(searchTerm, 'existing')}
            disabled={!searchTerm.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar "{searchTerm}" à análise
          </Button>
        )}

        <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-700/30 p-2 rounded">
          <Clock className="w-3 h-3" />
          O ativo será analisado e integrado automaticamente na conversa
        </div>
      </div>
    </Card>
  );
};

export default QuickActiveAdder;
