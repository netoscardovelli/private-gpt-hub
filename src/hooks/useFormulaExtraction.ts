
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const useFormulaExtraction = () => {
  const extractFormulasFromConversation = (messages: Message[]): string => {
    console.log('🔍 Iniciando extração de fórmulas...');
    console.log('📝 Total de mensagens:', messages.length);
    
    const formulaMessages = messages
      .filter(msg => msg.role === 'assistant')
      .filter(msg => {
        const hasFormulaIndicators = 
          msg.content.includes('**Composição') || 
          msg.content.includes('**COMPOSIÇÃO') ||
          msg.content.includes('📋 **FÓRMULAS PRESCRITAS:**') ||
          msg.content.includes('**FÓRMULAS PRESCRITAS:**') ||
          (msg.content.includes('• ') && msg.content.includes('mg')) ||
          msg.content.includes('Análise da Fórmula') ||
          msg.content.includes('**Benefícios Gerais') ||
          msg.content.includes('📚 Fundamentação Científica');
        
        console.log('🔎 Mensagem checada:', {
          preview: msg.content.substring(0, 100),
          hasFormulaIndicators
        });
        
        return hasFormulaIndicators;
      });

    console.log('📋 Mensagens com fórmulas encontradas:', formulaMessages.length);

    if (formulaMessages.length === 0) {
      console.log('❌ Nenhuma mensagem com fórmula encontrada');
      return '';
    }

    const lastFormulaAnalysis = formulaMessages[formulaMessages.length - 1];
    console.log('📄 Última análise de fórmula encontrada:', lastFormulaAnalysis.content.substring(0, 200));
    
    // Extrair a seção de fórmulas prescritas
    let extractedFormulas = '';
    
    // Primeiro, tentar encontrar a seção "FÓRMULAS PRESCRITAS"
    const prescribedFormulasMatch = lastFormulaAnalysis.content.match(/📋\s*\*\*FÓRMULAS PRESCRITAS:\*\*(.*?)(?=\*\*[A-Z]|\n\n\*\*|$)/s);
    if (prescribedFormulasMatch) {
      extractedFormulas = prescribedFormulasMatch[1].trim();
      console.log('✅ Fórmulas extraídas da seção PRESCRITAS:', extractedFormulas.substring(0, 100));
    } else {
      // Caso não encontre, tentar extrair composições individuais
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
      
      extractedFormulas = currentFormula || lastFormulaAnalysis.content;
      console.log('✅ Fórmulas extraídas por composição:', extractedFormulas.substring(0, 100));
    }
    
    console.log('🎯 Resultado final da extração:', extractedFormulas ? 'SUCESSO' : 'VAZIO');
    return extractedFormulas;
  };

  return {
    extractFormulasFromConversation
  };
};
