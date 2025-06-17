
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';

interface OptimizationSuggestionButtonProps {
  onSuggestOptimization: () => void;
  isLoading: boolean;
}

const OptimizationSuggestionButton = ({ 
  onSuggestOptimization, 
  isLoading 
}: OptimizationSuggestionButtonProps) => {
  return (
    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 rounded-lg border border-emerald-500/30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-emerald-300 mb-1">
            Quer otimizar suas fórmulas?
          </h4>
          <p className="text-xs text-slate-400">
            Receba sugestões de ativos complementares baseadas na análise científica
          </p>
        </div>
        <Button
          onClick={onSuggestOptimization}
          disabled={isLoading}
          size="sm"
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white ml-3"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          {isLoading ? 'Analisando...' : 'Sugerir Ativos'}
        </Button>
      </div>
    </div>
  );
};

export default OptimizationSuggestionButton;
