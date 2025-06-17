
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Plus } from 'lucide-react';

interface FormulaOptionSelectorProps {
  activeName: string;
  formulasCount: number;
  onSelectOption: (option: 'existing' | 'new') => void;
}

const FormulaOptionSelector = ({ 
  activeName, 
  formulasCount, 
  onSelectOption 
}: FormulaOptionSelectorProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Onde adicionar <span className="text-emerald-400">{activeName}</span>?
          </h4>
          <Badge className="bg-blue-600/30 text-blue-300 text-xs">
            {formulasCount} fórmula(s) detectada(s)
          </Badge>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => onSelectOption('existing')}
            variant="outline"
            className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/20 justify-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar a uma fórmula existente ({formulasCount} disponível(is))
          </Button>

          <Button
            onClick={() => onSelectOption('new')}
            variant="outline"
            className="w-full border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 justify-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar nova fórmula com este ativo
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FormulaOptionSelector;
