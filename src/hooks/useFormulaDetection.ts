
import { useState, useEffect } from 'react';

export const useFormulaDetection = (currentFormula: string) => {
  const [detectedFormulas, setDetectedFormulas] = useState<string[]>([]);

  const detectExistingFormulas = () => {
    console.log('🔍 Detectando fórmulas na conversa...');
    console.log('📝 Conteúdo recebido:', currentFormula.substring(0, 300));
    
    const formulas: string[] = [];
    
    // Padrões mais abrangentes para detectar fórmulas
    const formulaPatterns = [
      /\*\*Composição[:\s]*\*\*(.*?)(?=\*\*[^*]|\n\n)/gs,
      /\*\*COMPOSIÇÃO[:\s]*\*\*(.*?)(?=\*\*[^*]|\n\n)/gs,
      /Composição:(.*?)(?=\n\n|\*\*|$)/gs,
      /COMPOSIÇÃO:(.*?)(?=\n\n|\*\*|$)/gs,
      /📋\s*\*\*FÓRMULAS PRESCRITAS:\*\*(.*?)(?=\*\*[A-Z]|\n\n\*\*|$)/gs
    ];

    // Tentar cada padrão
    for (const pattern of formulaPatterns) {
      const matches = [...currentFormula.matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && match[1].trim()) {
          const formulaContent = match[1].trim();
          // Verificar se tem dosagens típicas de fórmula
          if (formulaContent.includes('mg') || formulaContent.includes('mcg') || formulaContent.includes('UI')) {
            formulas.push(formulaContent);
          }
        }
      }
    }

    // Método alternativo: buscar por listas com bullets e dosagens
    const lines = currentFormula.split('\n');
    let currentFormulaText = '';
    let foundComposition = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar início de composição
      if (line.toLowerCase().includes('composição') || 
          line.toLowerCase().includes('fórmula') && line.includes('**')) {
        if (currentFormulaText && foundComposition) {
          formulas.push(currentFormulaText.trim());
        }
        currentFormulaText = '';
        foundComposition = true;
        continue;
      }
      
      // Se encontrou composição e tem item com dosagem
      if (foundComposition && line.startsWith('•') && 
          (line.includes('mg') || line.includes('mcg') || line.includes('UI'))) {
        currentFormulaText += line + '\n';
      }
      
      // Parar quando encontra nova seção
      if (foundComposition && line.startsWith('**') && 
          !line.toLowerCase().includes('composição') && 
          !line.toLowerCase().includes('fórmula')) {
        if (currentFormulaText.trim()) {
          formulas.push(currentFormulaText.trim());
          currentFormulaText = '';
        }
        foundComposition = false;
      }
    }
    
    // Adicionar última fórmula se houver
    if (currentFormulaText.trim() && foundComposition) {
      formulas.push(currentFormulaText.trim());
    }

    // Remover duplicatas
    const uniqueFormulas = [...new Set(formulas)];
    
    console.log('📋 Fórmulas detectadas:', uniqueFormulas.length);
    console.log('🔍 Fórmulas encontradas:', uniqueFormulas.map(f => f.substring(0, 100)));
    
    setDetectedFormulas(uniqueFormulas);
    return uniqueFormulas;
  };

  useEffect(() => {
    detectExistingFormulas();
  }, [currentFormula]);

  return {
    detectedFormulas,
    detectExistingFormulas
  };
};
