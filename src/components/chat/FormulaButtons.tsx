
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
  // Não mostra mais os botões - retorna null sempre
  return null;
};

export default FormulaButtons;
