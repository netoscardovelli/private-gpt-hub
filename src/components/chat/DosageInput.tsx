
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Target, CheckCircle } from 'lucide-react';

interface DosageInputProps {
  activeName: string;
  isNewFormula: boolean;
  formulaIndex?: number;
  onConfirm: (dosage: string) => void;
  onBack: () => void;
}

const DosageInput = ({ 
  activeName, 
  isNewFormula, 
  formulaIndex, 
  onConfirm, 
  onBack 
}: DosageInputProps) => {
  const [dosage, setDosage] = useState('');

  const handleConfirm = () => {
    onConfirm(dosage);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Definir dosagem para <span className="text-emerald-400">{activeName}</span>
          </h4>
        </div>

        <div className="bg-emerald-700/20 p-3 rounded-lg">
          <p className="text-xs text-emerald-300">
            {isNewFormula 
              ? '🆕 Criando nova fórmula - dosagem obrigatória'
              : `📋 Adicionando à fórmula ${(formulaIndex || 0) + 1} - dosagem opcional`
            }
          </p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Ex: 10mg, 500mcg, 2ui..."
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white text-sm"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={isNewFormula && !dosage.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
              size="sm"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {isNewFormula ? 'Criar Nova Fórmula' : 'Adicionar à Fórmula'}
            </Button>
            
            <Button
              onClick={onBack}
              variant="outline"
              className="border-slate-500 text-slate-300"
              size="sm"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DosageInput;
