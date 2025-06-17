
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight } from 'lucide-react';

interface FormulaSelectorProps {
  formulas: string[];
  selectedFormulas: string[];
  onFormulaToggle: (formula: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  activeName: string;
}

const FormulaSelector = ({ 
  formulas, 
  onCancel,
  activeName 
}: FormulaSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleFormulaClick = (index: number) => {
    setSelectedIndex(index);
    // Simular confirmação automática após seleção
    setTimeout(() => {
      // Aqui deveria chamar uma função para continuar
      console.log('Fórmula selecionada:', index);
    }, 100);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Escolha a fórmula para adicionar <span className="text-emerald-400">{activeName}</span>
          </h4>
        </div>

        <div className="space-y-2">
          {formulas.map((formula, index) => (
            <div
              key={index}
              className="p-3 rounded border border-slate-500 bg-slate-600/30 text-slate-300 hover:bg-slate-600/50 cursor-pointer transition-all"
              onClick={() => handleFormulaClick(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Badge className="bg-blue-600/30 text-blue-300 text-xs mb-2">
                    Fórmula {index + 1}
                  </Badge>
                  <p className="text-xs">{formula.substring(0, 150)}...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onCancel}
          variant="outline"
          className="border-slate-500 text-slate-300"
          size="sm"
        >
          Voltar
        </Button>
      </div>
    </Card>
  );
};

export default FormulaSelector;
