
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Target, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuickActiveAdder from './QuickActiveAdder';
import { DRUG_DATABASE, getIndicationBasedSuggestions } from '@/data/pharmacologyData';

interface ActiveSuggestionsProps {
  onAddActiveToFormula: (actives: any[]) => void;
  messageContent: string;
  userId: string;
}

const ActiveSuggestions = ({ onAddActiveToFormula, messageContent, userId }: ActiveSuggestionsProps) => {
  const [showQuickAdder, setShowQuickAdder] = useState(false);
  const { toast } = useToast();

  // Verificar se a mensagem contém uma análise REAL de fórmula (não apenas instruções)
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
    
    // Verificar se NÃO é uma mensagem de instrução inicial
    const isInstructionMessage = messageContent.includes('Cole suas fórmulas aqui') ||
      messageContent.includes('Cole sua fórmula e vamos começar') ||
      messageContent.includes('Perfeito! Cole suas fórmulas') ||
      messageContent.includes('vamos começar!');
    
    // Se for mensagem de instrução, não mostrar sugestões
    if (isInstructionMessage) {
      return false;
    }
    
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
    
    // Detectar condição clínica principal
    let primaryCondition = '';
    if (analysisLower.includes('fibromialgia')) {
      primaryCondition = 'fibromialgia';
    } else if (analysisLower.includes('diabetes')) {
      primaryCondition = 'diabetes';
    } else if (analysisLower.includes('emagrecimento')) {
      primaryCondition = 'emagrecimento';
    }
    
    // Sugestões baseadas em evidência científica para a condição
    if (primaryCondition === 'fibromialgia') {
      // Para fibromialgia: vitamina D3, ômega 3 e curcumina têm evidências científicas
      if (!currentActives.some(a => a.toLowerCase().includes('vitamina d'))) {
        suggestions.push({
          name: 'Vitamina D3',
          concentration: '2000 UI',
          benefit: 'Redução da dor e melhora da função muscular',
          mechanism: 'Modulação da inflamação e função neuromuscular',
          synergy: 'Potencializa efeitos do magnésio na função muscular',
          evidence: 'Estudos mostram deficiência de vitamina D em 83% dos pacientes com fibromialgia'
        });
      }
      
      if (!currentActives.some(a => a.toLowerCase().includes('omega'))) {
        suggestions.push({
          name: 'Ômega 3',
          concentration: '2000mg',
          benefit: 'Ação anti-inflamatória e melhora da dor',
          mechanism: 'Inibição de citocinas pró-inflamatórias',
          synergy: 'Complementa a ação anti-inflamatória do magnésio',
          evidence: 'Meta-análise mostra redução significativa da dor em fibromialgia'
        });
      }
    }
    
    // REMOVER berberina para fibromialgia - não há indicação clínica
    // Berberina é indicada para diabetes/resistência insulínica, não fibromialgia
    
    return suggestions.slice(0, 2); // Máximo 2 sugestões baseadas em evidência
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

  // Não mostrar nada se não há análise REAL de fórmula
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
      {/* Sugestões Inteligentes baseadas em evidência */}
      {showSuggestions && (
        <Card className="bg-slate-800/50 border-slate-600 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-slate-200">
                💡 Sugestões Baseadas em Evidência Científica
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
                      <p className="text-xs text-slate-400 mb-1">
                        <span className="font-medium">Sinergia:</span> {suggestion.synergy}
                      </p>
                      {suggestion.evidence && (
                        <p className="text-xs text-blue-300 bg-blue-900/30 p-1 rounded">
                          <span className="font-medium">📚 Evidência:</span> {suggestion.evidence}
                        </p>
                      )}
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
            
            <div className="text-xs text-slate-400 bg-slate-700/30 p-2 rounded flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Sugestões baseadas em literatura científica específica para a condição diagnóstica
            </div>
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
