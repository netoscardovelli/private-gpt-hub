
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickActionButtonsProps {
  content: string;
  onQuickAction: (action: string) => void;
}

const QuickActionButtons = ({ content, onQuickAction }: QuickActionButtonsProps) => {
  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'analise': '🔬 Análise de Fórmulas',
      'formulas-cadastradas': '📋 Fórmulas Cadastradas',
      'sugestao-formulas': '💡 Sugestões de Fórmulas',
      'caso-clinico-completo': '📋 Colar Caso Clínico',
      'construir-passo-a-passo': '🎯 Construir Passo a Passo'
    };
    return labels[action] || action;
  };

  const renderQuickActions = (content: string) => {
    const quickActionRegex = /<quick-action>(.*?)<\/quick-action>/g;
    const actions = [];
    let match;

    while ((match = quickActionRegex.exec(content)) !== null) {
      const actionValue = match[1];
      if (actionValue) {
        actions.push(
          <Button
            key={match.index}
            onClick={() => onQuickAction(actionValue)}
            size="sm"
            className="mx-1 my-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {getActionLabel(actionValue)}
          </Button>
        );
      }
    }
    
    return actions;
  };

  const hasQuickActions = content.includes('<quick-action>');
  
  if (!hasQuickActions) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {renderQuickActions(content)}
    </div>
  );
};

export default QuickActionButtons;
