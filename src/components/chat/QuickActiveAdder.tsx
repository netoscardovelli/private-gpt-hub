
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFormulaDetection } from '@/hooks/useFormulaDetection';
import { Plus, Target, CheckCircle, Search } from 'lucide-react';

interface QuickActiveAdderProps {
  onAddActive: (actives: any[]) => void;
  currentFormula: string;
  specialty: string;
}

const QuickActiveAdder = ({ onAddActive, currentFormula, specialty }: QuickActiveAdderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActive, setSelectedActive] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | ''>('');
  const [selectedFormulaIndex, setSelectedFormulaIndex] = useState<string>('');
  const { toast } = useToast();
  const { detectedFormulas } = useFormulaDetection(currentFormula);

  // Sugestões inteligentes baseadas na especialidade
  const getSmartSuggestions = () => {
    const suggestions: { name: string; reason: string; icon: string }[] = [];
    
    if (specialty === 'endocrinologia') {
      suggestions.push(
        { name: 'Morosil', reason: 'Queima de gordura localizada', icon: '🔥' },
        { name: 'Berberina', reason: 'Sensibilidade à insulina', icon: '🎯' },
        { name: 'Picolinato de Cromo', reason: 'Controle glicêmico', icon: '📊' }
      );
    } else {
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

  const handleInsert = () => {
    const activeToAdd = selectedActive || searchTerm.trim();
    
    if (!activeToAdd) {
      toast({
        title: "Erro",
        description: "Selecione ou digite o nome do ativo",
        variant: "destructive"
      });
      return;
    }

    if (!selectedOption) {
      toast({
        title: "Erro", 
        description: "Escolha onde adicionar o ativo",
        variant: "destructive"
      });
      return;
    }

    if (selectedOption === 'existing' && !selectedFormulaIndex) {
      toast({
        title: "Erro",
        description: "Selecione qual fórmula para adicionar o ativo",
        variant: "destructive"
      });
      return;
    }

    if (selectedOption === 'new' && !dosage.trim()) {
      toast({
        title: "Erro",
        description: "Para nova fórmula, a dosagem é obrigatória",
        variant: "destructive"
      });
      return;
    }

    const newActive = {
      name: activeToAdd,
      concentration: dosage || 'A definir',
      benefit: 'Conforme análise clínica',
      mechanism: 'Revisar literatura',
      formulaIndex: selectedOption === 'existing' ? parseInt(selectedFormulaIndex) : -1,
      createNew: selectedOption === 'new'
    };

    console.log('🚀 Adicionando ativo:', newActive);
    
    // Chama a função correta que irá processar o ativo e gerar nova análise
    onAddActive([newActive]);
    
    toast({
      title: "Ativo adicionado!",
      description: `${activeToAdd} será incluído na análise`,
    });

    // Reset form
    setSearchTerm('');
    setSelectedActive('');
    setDosage('');
    setSelectedOption('');
    setSelectedFormulaIndex('');
  };

  const smartSuggestions = getSmartSuggestions();

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        {/* Header */}
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

        {/* Search/Select Active */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Digite o nome do ativo (ex: Oxandrolona, Morosil...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white pl-10 text-sm"
              />
            </div>
          </div>

          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">Sugestões inteligentes</span>
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
        </div>

        {/* Where to Add */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-300">Onde adicionar?</label>
          
          {detectedFormulas.length > 0 ? (
            <div className="space-y-2">
              <Button
                onClick={() => setSelectedOption('existing')}
                variant={selectedOption === 'existing' ? 'default' : 'outline'}
                className={`w-full justify-start text-sm ${
                  selectedOption === 'existing' 
                    ? 'bg-blue-600 text-white' 
                    : 'border-blue-500/50 text-blue-300 hover:bg-blue-500/20'
                }`}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar a uma fórmula existente
              </Button>
              
              <Button
                onClick={() => setSelectedOption('new')}
                variant={selectedOption === 'new' ? 'default' : 'outline'}
                className={`w-full justify-start text-sm ${
                  selectedOption === 'new' 
                    ? 'bg-emerald-600 text-white' 
                    : 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20'
                }`}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar nova fórmula
              </Button>
            </div>
          ) : (
            <div className="bg-emerald-700/20 p-3 rounded-lg">
              <p className="text-xs text-emerald-300">
                🆕 Nenhuma fórmula detectada. Será criada uma nova fórmula.
              </p>
              <Button
                onClick={() => setSelectedOption('new')}
                variant="outline"
                className="w-full mt-2 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 justify-start"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar nova fórmula
              </Button>
            </div>
          )}
        </div>

        {/* Formula Selector (only if existing option selected) */}
        {selectedOption === 'existing' && detectedFormulas.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Escolha a fórmula:</label>
            <Select value={selectedFormulaIndex} onValueChange={setSelectedFormulaIndex}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Selecione uma fórmula..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {detectedFormulas.map((formula, index) => (
                  <SelectItem 
                    key={index} 
                    value={index.toString()}
                    className="text-white hover:bg-slate-600"
                  >
                    <div>
                      <Badge className="bg-blue-600/30 text-blue-300 text-xs mb-1">
                        Fórmula {index + 1}
                      </Badge>
                      <p className="text-xs text-slate-300">
                        {formula.substring(0, 80)}...
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dosage Input */}
        {selectedOption && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Dosagem {selectedOption === 'new' ? '(obrigatória)' : '(opcional)'}
            </label>
            <Input
              placeholder="Ex: 10mg, 500mcg, 2ui..."
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white text-sm"
            />
            {selectedOption === 'new' && (
              <p className="text-xs text-emerald-300">
                🆕 Para criar nova fórmula, a dosagem é obrigatória
              </p>
            )}
          </div>
        )}

        {/* Insert Button */}
        <Button
          onClick={handleInsert}
          disabled={!selectedActive && !searchTerm.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="sm"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Inserir Ativo
        </Button>
      </div>
    </Card>
  );
};

export default QuickActiveAdder;
