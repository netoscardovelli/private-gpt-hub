
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Search, Target, ArrowRight } from 'lucide-react';

interface ActiveSelectorProps {
  onContinue: (activeName: string) => void;
  specialty: string;
}

const ActiveSelector = ({ onContinue, specialty }: ActiveSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActive, setSelectedActive] = useState('');

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

  const handleContinue = () => {
    const activeToAdd = selectedActive || searchTerm.trim();
    if (activeToAdd) {
      onContinue(activeToAdd);
    }
  };

  const smartSuggestions = getSmartSuggestions();

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Adicionar Ativo Esquecido
          </h4>
        </div>

        <div className="bg-slate-700/30 p-3 rounded-lg">
          <p className="text-xs text-slate-300">
            ✨ Escolha um ativo para adicionar à análise de fórmulas.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Digite o nome do ativo (ex: Oxandrolona, Morosil...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                className="bg-slate-700 border-slate-600 text-white pl-10 text-sm"
              />
            </div>
          </div>
        </div>

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

        <Button
          onClick={handleContinue}
          disabled={!(selectedActive || searchTerm.trim())}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="sm"
        >
          <ArrowRight className="w-3 h-3 mr-1" />
          Continuar com "{selectedActive || searchTerm}"
        </Button>
      </div>
    </Card>
  );
};

export default ActiveSelector;
