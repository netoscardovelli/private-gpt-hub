
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Check } from 'lucide-react';

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
  selectedFormulas, 
  onFormulaToggle, 
  onConfirm, 
  onCancel,
  activeName 
}: FormulaSelectorProps) => {
  return (
    <Card className="bg-slate-700/50 border-slate-600 p-4 mt-3">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Em qual(is) fórmula(s) adicionar <span className="text-emerald-400">{activeName}</span>?
          </h4>
        </div>

        <div className="space-y-2">
          {formulas.map((formula, index) => (
            <div
              key={index}
              className={`p-3 rounded border cursor-pointer transition-all ${
                selectedFormulas.includes(formula)
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                  : 'bg-slate-600/30 border-slate-500 text-slate-300 hover:bg-slate-600/50'
              }`}
              onClick={() => onFormulaToggle(formula)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600/30 text-blue-300 text-xs">
                      Fórmula {index + 1}
                    </Badge>
                    {selectedFormulas.includes(formula) && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs mt-1 line-clamp-2">{formula}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onConfirm}
            disabled={selectedFormulas.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
            size="sm"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar às {selectedFormulas.length} selecionada(s)
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-slate-500 text-slate-300"
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FormulaSelector;
