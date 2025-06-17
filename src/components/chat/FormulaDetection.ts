
export const detectFormulaAnalysis = (message: { role: string; content: string }): boolean => {
  if (message.role !== 'assistant') return false;
  
  const content = message.content;
  
  // Verificações específicas para análise de fórmula
  const hasComposition = content.includes('**Composição') || content.includes('**COMPOSIÇÃO');
  const hasAnalysis = content.includes('Análise da Fórmula');
  const hasBenefits = content.includes('**Benefícios Gerais');
  const hasImportance = content.includes('**Importância do Uso');
  const hasFoundation = content.includes('📚 Fundamentação Científica');
  const hasInstructions = content.includes('**Instruções de Uso');
  const hasFormulaText = content.includes('Essa fórmula foi desenvolvida') || content.includes('elaborei essa fórmula');
  
  // Detectar múltiplas dosagens (indicativo de fórmula)
  const dosageMatches = (content.match(/\d+\s*(mg|mcg|UI|g)/g) || []).length;
  const hasMultipleDosages = dosageMatches >= 3;
  
  // Verificar se tem unidades farmacêuticas típicas em conjunto
  const hasPharmUnits = content.includes('mg') && content.includes('UI') && content.includes('mcg');
  
  const isFormulaAnalysis = hasComposition || hasAnalysis || hasBenefits || hasImportance || 
                           hasFoundation || hasInstructions || hasFormulaText || 
                           hasMultipleDosages || hasPharmUnits;
  
  return isFormulaAnalysis;
};
