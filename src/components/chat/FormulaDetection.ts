
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
  const dosageMatches = (content.match(/\d+\s*(mg|mcg|UI|g)\b/g) || []).length;
  const hasMultipleDosages = dosageMatches >= 3;
  
  // Verificar se tem unidades farmacêuticas típicas em conjunto
  const hasPharmUnits = content.includes('mg') && (content.includes('UI') || content.includes('mcg'));
  
  // Detectar listas de ativos com bullet points
  const hasActiveList = content.includes('• ') && dosageMatches >= 2;
  
  // Detectar texto de fórmulas prescritas
  const hasFormulasPrescribed = content.includes('📋 **FÓRMULAS PRESCRITAS:**') || content.includes('**FÓRMULAS PRESCRITAS:**');
  
  // Detectar início típico de análise de fórmula
  const hasTypicalStart = content.includes('Tendo em vista sua história clínica') || content.includes('elaborei essa');
  
  // Detectar seções típicas de análise
  const hasTypicalSections = content.includes('**Benefícios Gerais') && content.includes('**Importância do Uso');
  
  const isFormulaAnalysis = hasComposition || hasAnalysis || hasBenefits || hasImportance || 
                           hasFoundation || hasInstructions || hasFormulaText || 
                           hasMultipleDosages || hasPharmUnits || hasActiveList || 
                           hasFormulasPrescribed || hasTypicalStart || hasTypicalSections;
  
  console.log('🔍 Detecção de fórmula - Debug:', {
    role: message.role,
    isFormulaAnalysis,
    hasComposition,
    hasAnalysis,
    hasBenefits,
    hasFoundation,
    hasActiveList,
    hasFormulasPrescribed,
    hasTypicalStart,
    hasTypicalSections,
    dosageMatches,
    contentPreview: content.substring(0, 200) + '...'
  });
  
  return isFormulaAnalysis;
};
