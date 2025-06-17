
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const useFormulaExtraction = () => {
  const extractFormulasFromConversation = (messages: Message[]): string => {
    const formulaMessages = messages
      .filter(msg => msg.role === 'assistant')
      .filter(msg => 
        msg.content.includes('**Composição') || 
        msg.content.includes('• ') && msg.content.includes('mg') ||
        msg.content.includes('Análise da Fórmula')
      );

    if (formulaMessages.length === 0) {
      return '';
    }

    const lastFormulaAnalysis = formulaMessages[formulaMessages.length - 1];
    const lines = lastFormulaAnalysis.content.split('\n');
    let currentFormula = '';
    let isComposition = false;
    
    for (const line of lines) {
      if (line.includes('**Composição') || line.includes('**COMPOSIÇÃO')) {
        isComposition = true;
        continue;
      }
      
      if (line.includes('**') && !line.includes('Composição') && !line.includes('COMPOSIÇÃO')) {
        isComposition = false;
      }
      
      if (isComposition && line.trim().startsWith('•')) {
        currentFormula += line.trim() + '\n';
      }
    }
    
    return currentFormula || lastFormulaAnalysis.content;
  };

  return {
    extractFormulasFromConversation
  };
};
