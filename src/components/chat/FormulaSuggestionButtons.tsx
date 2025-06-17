
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormulaSuggestionButtonsProps {
  onQuickAction: (action: string) => void;
  onAddActiveToFormula: (actives: any[]) => void;
  onShowQuickActiveAdder: () => void;
}

const FormulaSuggestionButtons = ({ 
  onQuickAction, 
  onAddActiveToFormula,
  onShowQuickActiveAdder
}: FormulaSuggestionButtonsProps) => {
  const { toast } = useToast();

  const handleSuggestOptimization = () => {
    console.log('🎯 Botão "Sugerir Ativos" clicado');
    onQuickAction('suggest-improvements');
  };

  const handleAddCustomActives = () => {
    console.log('🎯 Botão "Ativos Esquecidos" clicado');
    onShowQuickActiveAdder();
  };

  console.log('🔧 FormulaSuggestionButtons renderizado');

  return (
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
            onClick={handleSuggestOptimization}
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
            onClick={handleAddCustomActives}
            size="sm"
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white ml-3"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormulaSuggestionButtons;
