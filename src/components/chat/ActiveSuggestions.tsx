
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuickActiveAdder from './QuickActiveAdder';

interface ActiveSuggestionsProps {
  onAddActiveToFormula: (actives: any[]) => void;
  messageContent: string;
  userId: string;
}

const ActiveSuggestions = ({ onAddActiveToFormula, messageContent, userId }: ActiveSuggestionsProps) => {
  const [showQuickAdder, setShowQuickAdder] = useState(false);
  const { toast } = useToast();

  // Verificar se a mensagem contém uma análise de fórmula
  const hasFormulaAnalysis = () => {
    const analysisIndicators = [
      '• ',  // Lista de ativos
      'mg',  // Dosagens
      'Fórmula',
      'Composição',
      'COMPOSIÇÃO',
      'Incompatibilidade',
      'Compatibilidade'
    ];
    
    return analysisIndicators.some(indicator => 
      messageContent.toLowerCase().includes(indicator.toLowerCase())
    ) && messageContent.length > 200; // Mensagem substancial
  };

  const extractActivesFromAnalysis = () => {
    const lines = messageContent.split('\n');
    const actives: string[] = [];
    
    lines.forEach(line => {
      const activeMatch = line.match(/• ([^:]+):/);
      if (activeMatch) {
        actives.push(activeMatch[1].trim());
      }
    });
    
    return actives;
  };

  const generateSmartSuggestions = () => {
    const analysisLower = messageContent.toLowerCase();
    const suggestions: any[] = [];
    const currentActives = extractActivesFromAnalysis();
    
    // Sugestões baseadas no contexto da análise
    if (analysisLower.includes('emagrecimento') || analysisLower.includes('obesidade')) {
      if (!currentActives.some(a => a.toLowerCase().includes('carnitina'))) {
        suggestions.push({
          name: 'L-Carnitina',
          concentration: '1000mg',
          benefit: 'Oxidação de gorduras',
          mechanism: 'Transporte de ácidos graxos para mitocôndrias',
          synergy: 'Potencializa queima de gordura'
        });
      }
      
      if (!currentActives.some(a => a.toLowerCase().includes('cromo'))) {
        suggestions.push({
          name: 'Picolinato de Cromo',
          concentration: '200mcg',
          benefit: 'Controle do apetite',
          mechanism: 'Melhora sensibilidade à insulina',
          synergy: 'Reduz compulsão por doces'
        });
      }
    }
    
    if (analysisLower.includes('diabetes') || analysisLower.includes('glicemia')) {
      if (!currentActives.some(a => a.toLowerCase().includes('berberina'))) {
        suggestions.push({
          name: 'Berberina',
          concentration: '500mg',
          benefit: 'Controle glicêmico',
          mechanism: 'Ativação da AMPK',
          synergy: 'Melhora sensibilidade insulínica'
        });
      }
    }
    
    if (analysisLower.includes('colesterol') || analysisLower.includes('lipídios')) {
      if (!currentActives.some(a => a.toLowerCase().includes('omega'))) {
        suggestions.push({
          name: 'Ômega 3',
          concentration: '1000mg',
          benefit: 'Melhora perfil lipídico',
          mechanism: 'Anti-inflamatório cardiovascular',
          synergy: 'Reduz triglicerídeos'
        });
      }
    }
    
    return suggestions.slice(0, 3); // Máximo 3 sugestões
  };

  const handleAddActiveManually = (activeName: string) => {
    const newActive = {
      name: activeName,
      concentration: 'A definir',
      benefit: 'Conforme análise clínica',
      mechanism: 'Revisar literatura'
    };
    
    onAddActiveToFormula([newActive]);
    setShowQuickAdder(false);
  };

  const suggestions = generateSmartSuggestions();
  const showSuggestions = hasFormulaAnalysis() && suggestions.length > 0;

  // Não mostrar nada se não há análise de fórmula
  if (!hasFormulaAnalysis()) {
    return null;
  }

  if (showQuickAdder) {
    return (
      <QuickActiveAdder
        onAddActive={handleAddActiveManually}
        currentFormula={messageContent}
        specialty="geral"
      />
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Sugestões Inteligentes */}
      {showSuggestions && (
        <Card className="bg-slate-800/50 border-slate-600 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-slate-200">
                💡 Sugestões de Otimização
              </h4>
            </div>
            
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-emerald-300">
                          {suggestion.name}
                        </span>
                        <Badge className="bg-emerald-600/30 text-emerald-300 text-xs">
                          {suggestion.concentration}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mb-1">
                        <span className="font-medium">Benefício:</span> {suggestion.benefit}
                      </p>
                      <p className="text-xs text-slate-400">
                        <span className="font-medium">Sinergia:</span> {suggestion.synergy}
                      </p>
                    </div>
                    <Button
                      onClick={() => onAddActiveToFormula([suggestion])}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white ml-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Incluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {suggestions.length > 0 && (
              <Button
                onClick={() => onAddActiveToFormula(suggestions)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
              >
                <Target className="w-3 h-3 mr-1" />
                Incluir Todas as Sugestões ({suggestions.length})
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Adicionar Ativo Manualmente */}
      <Card className="bg-slate-800/50 border-slate-600 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-slate-200">
              Esqueceu algum ativo?
            </span>
          </div>
          <Button
            onClick={() => setShowQuickAdder(true)}
            size="sm"
            variant="outline"
            className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ActiveSuggestions;
