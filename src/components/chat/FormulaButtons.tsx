
import { Button } from '@/components/ui/button';
import { BookOpen, Lightbulb, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FormulaButtonsProps {
  onShowRegisteredFormulas: () => void;
  onShowFormulaSuggestions: () => void;
  showButtons: boolean;
}

const FormulaButtons = ({ 
  onShowRegisteredFormulas, 
  onShowFormulaSuggestions, 
  showButtons 
}: FormulaButtonsProps) => {
  if (!showButtons) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-600 p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onShowRegisteredFormulas}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Fórmulas Cadastradas
        </Button>
        
        <Button
          onClick={onShowFormulaSuggestions}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Sugestão de Fórmulas
        </Button>
      </div>
    </Card>
  );
};

export default FormulaButtons;
