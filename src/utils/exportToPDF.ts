import jsPDF from 'jspdf';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const exportChatToPDF = (messages: Message[]) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Cores profissionais
  const primaryBlue = [41, 98, 255] as const;
  const darkGray = [51, 65, 85] as const;
  const lightGray = [148, 163, 184] as const;
  const greenAccent = [16, 185, 129] as const;
  const redAlert = [220, 38, 38] as const;
  const white = [255, 255, 255] as const;
  const orangeWarning = [251, 146, 60] as const;

  // Header profissional com gradiente
  pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Adicionar um segundo retângulo para simular gradiente
  pdf.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.rect(0, 40, pageWidth, 5, 'F');

  // Logo/Título principal
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRESCRICAO FARMACEUTICA', margin, 22);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Analise Tecnica e Orientacoes Terapeuticas', margin, 32);

  // Informações do cabeçalho
  yPosition = 60;
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DOCUMENTO TECNICO FARMACEUTICO', margin, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.text(`Emitido em: ${currentDate}`, margin, yPosition);
  yPosition += 6;
  pdf.text('Protocolo: ' + Math.random().toString(36).substr(2, 9).toUpperCase(), margin, yPosition);
  yPosition += 6;
  pdf.text('Sistema: Formula.AI - Analise Farmaceutica Especializada', margin, yPosition);
  yPosition += 20;

  // Linha separadora elegante
  pdf.setDrawColor(greenAccent[0], greenAccent[1], greenAccent[2]);
  pdf.setLineWidth(2);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // SEÇÃO 1 - ENTENDA SUA PRESCRIÇÃO
  pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 20, 'F');
  
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1 - ENTENDA SUA PRESCRICAO:', margin + 5, yPosition + 8);
  yPosition += 30;

  // Conteúdo explicativo da prescrição
  const prescriptionExplanation = [
    {
      titulo: 'O QUE SAO MEDICAMENTOS MANIPULADOS?',
      texto: 'Os medicamentos manipulados sao formulacoes personalizadas, preparadas especificamente para suas necessidades individuais. Diferente dos medicamentos industrializados, eles permitem ajustes precisos de doses, combinacoes de ativos e formas farmaceuticas ideais para seu tratamento.'
    },
    {
      titulo: 'POR QUE FORAM PRESCRITOS PARA VOCE?',
      texto: 'Sua prescricao foi elaborada considerando seu perfil clinico, necessidades especificas e objetivos terapeuticos. Cada formula foi cuidadosamente desenvolvida para atuar de forma sinergica, maximizando os beneficios e otimizando sua resposta ao tratamento.'
    },
    {
      titulo: 'COMO FUNCIONAM EM CONJUNTO?',
      texto: 'Todas as formulas trabalham de maneira complementar em seu organismo. Enquanto algumas atuam em aspectos especificos (como saude intestinal ou energia), outras oferecem suporte geral (como antioxidantes e anti-inflamatorios), criando um protocolo integrado e eficiente.'
    },
    {
      titulo: 'IMPORTANCIA DA ADESAO AO TRATAMENTO',
      texto: 'O sucesso do tratamento depende do uso regular e correto das formulacoes. Cada medicamento tem seu tempo de acao e mecanismo especifico. A interrupcao precoce ou uso inadequado pode comprometer os resultados esperados.'
    }
  ];

  prescriptionExplanation.forEach((secao) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }

    // Título da seção
    pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(secao.titulo, margin, yPosition);
    yPosition += 12;

    // Texto da seção
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const textLines = pdf.splitTextToSize(secao.texto, maxWidth - 10);
    textLines.forEach((line: string) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 15;
  });

  // Linha separadora antes das orientações gerais
  pdf.setDrawColor(greenAccent[0], greenAccent[1], greenAccent[2]);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // SEÇÃO DE ORIENTAÇÕES GERAIS DAS FÓRMULAS
  pdf.setFillColor(orangeWarning[0], orangeWarning[1], orangeWarning[2]);
  pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 20, 'F');
  
  pdf.setTextColor(white[0], white[1], white[2]);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ORIENTACOES GERAIS DOS MANIPULADOS', margin + 5, yPosition + 8);
  yPosition += 30;

  // Orientações detalhadas
  const orientacoes = [
    {
      titulo: 'ARMAZENAMENTO',
      itens: [
        'Mantenha em local seco, fresco e ao abrigo da luz',
        'Temperatura ambiente (15°C a 30°C)',
        'Mantenha fora do alcance de criancas e animais',
        'Nao armazene em banheiros ou locais umidos'
      ]
    },
    {
      titulo: 'MODO DE USO',
      itens: [
        'Siga rigorosamente a posologia prescrita',
        'Respeite os horarios de administracao',
        'Nao interrompa o tratamento sem orientacao',
        'Em caso de duvidas, consulte seu farmaceutico'
      ]
    },
    {
      titulo: 'PRECAUCOES IMPORTANTES',
      itens: [
        'Verifique o prazo de validade antes do uso',
        'Observe alteracoes na cor, odor ou consistencia',
        'Nao use se houver sinais de deterioracao',
        'Mantenha a embalagem original sempre fechada'
      ]
    },
    {
      titulo: 'REACOES ADVERSAS',
      itens: [
        'Suspenda o uso em caso de reacoes alergicas',
        'Procure atendimento medico se houver efeitos indesejados',
        'Comunique ao farmaceutico qualquer reacao observada',
        'Mantenha registro de sintomas ou alteracoes'
      ]
    }
  ];

  orientacoes.forEach((secao) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    // Título da seção
    pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(secao.titulo, margin, yPosition);
    yPosition += 15;

    // Itens da seção
    secao.itens.forEach((item) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const itemLines = pdf.splitTextToSize(`• ${item}`, maxWidth - 10);
      itemLines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 6;
      });
    });
    
    yPosition += 10;
  });

  // Linha separadora antes das análises
  pdf.setDrawColor(greenAccent[0], greenAccent[1], greenAccent[2]);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // Filtrar mensagens relevantes para análise - FILTRO MELHORADO
  const analysisMessages = messages.filter(msg => {
    if (msg.role !== 'assistant') return false;
    
    const content = msg.content.toLowerCase();
    
    // Excluir mensagens de boas-vindas e solicitações
    const excludePatterns = [
      'olá',
      'cole suas fórmulas',
      'estou aqui para ajudar',
      'por favor, cole a fórmula',
      'gostaria que eu analisasse',
      'farei uma explicação',
      'aguardando sua fórmula',
      'envie a prescrição',
      'compartilhe as fórmulas'
    ];
    
    // Se contém padrões de exclusão, não incluir
    const hasExcludePattern = excludePatterns.some(pattern => content.includes(pattern));
    if (hasExcludePattern) return false;
    
    // Deve conter indicadores de análise real
    const analysisIndicators = [
      'tendo em vista sua história clínica',
      'fórmula',
      'composição:',
      'posologia:',
      'explicação:',
      'mg',
      'g/',
      'ml',
      'cápsula',
      'sachê',
      'dose',
      'benefícios gerais',
      'importância do uso'
    ];
    
    const hasAnalysisIndicator = analysisIndicators.some(indicator => content.includes(indicator));
    
    // Deve ter tamanho mínimo e conter análise real
    return msg.content.length > 200 && hasAnalysisIndicator;
  });

  if (analysisMessages.length === 0) {
    // Se não há análises, mostrar mensagem informativa
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'F');
    
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANALISES FARMACEUTICAS', margin + 5, yPosition + 8);
    yPosition += 20;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text('Nenhuma analise farmaceutica foi realizada nesta sessao.', margin + 5, yPosition);
    yPosition += 20;
  } else {
    // Processar análises com nova estrutura
    analysisMessages.forEach((message, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }

      // Título da análise com numeração
      pdf.setFillColor(greenAccent[0], greenAccent[1], greenAccent[2]);
      pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 20, 'F');
      
      pdf.setTextColor(white[0], white[1], white[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`ANALISE TECNICA ${index + 1}`, margin + 5, yPosition + 8);
      yPosition += 25;

      const content = message.content;
      
      // Extrair informações das fórmulas do conteúdo
      const formulaMatches = content.match(/\*\*(\d+\.\s*.*?)\*\*[\s\S]*?(?=\*\*\d+\.|$)/g) || [];
      
      if (formulaMatches.length > 0) {
        // Processar cada fórmula encontrada
        formulaMatches.forEach((formulaBlock, formulaIndex) => {
          // Verificar se precisa de nova página
          if (yPosition > pageHeight - 100) {
            pdf.addPage();
            yPosition = margin;
          }

          // Extrair nome da fórmula
          const formulaNameMatch = formulaBlock.match(/\*\*(\d+\.\s*.*?)\*\*/);
          const formulaName = formulaNameMatch ? formulaNameMatch[1] : `Formula ${formulaIndex + 1}`;

          // SEÇÃO: COMPOSIÇÃO DA FÓRMULA
          pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          pdf.rect(margin, yPosition - 3, pageWidth - (margin * 2), 15, 'F');
          
          pdf.setTextColor(white[0], white[1], white[2]);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('COMPOSICAO DA FORMULA', margin + 5, yPosition + 8);
          yPosition += 20;

          // Nome da fórmula
          pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`FORMULA: ${formulaName.toUpperCase()}`, margin + 5, yPosition);
          yPosition += 12;

          // Extrair composição
          const compositionMatch = formulaBlock.match(/\*\*Composição:\*\*([\s\S]*?)(?=\*\*Posologia:|$)/);
          if (compositionMatch) {
            const composition = compositionMatch[1].trim();
            const activeLines = composition.split('\n').filter(line => line.trim().startsWith('•'));
            
            if (activeLines.length > 0) {
              pdf.setFont('helvetica', 'bold');
              pdf.text('ATIVOS:', margin + 5, yPosition);
              yPosition += 8;
              
              pdf.setFont('helvetica', 'normal');
              activeLines.forEach((line) => {
                if (yPosition > pageHeight - 40) {
                  pdf.addPage();
                  yPosition = margin;
                }
                const cleanLine = line.replace('•', '').trim();
                pdf.text(`• ${cleanLine}`, margin + 10, yPosition);
                yPosition += 7;
              });
            }
          }

          // Extrair posologia
          const posologyMatch = formulaBlock.match(/\*\*Posologia:\*\*(.*?)(?=\n|$)/);
          if (posologyMatch) {
            const posology = posologyMatch[1].trim();
            pdf.setFont('helvetica', 'bold');
            pdf.text('POSOLOGIA:', margin + 5, yPosition);
            yPosition += 8;
            
            pdf.setFont('helvetica', 'normal');
            const posologyLines = pdf.splitTextToSize(posology, maxWidth - 20);
            posologyLines.forEach((line: string) => {
              pdf.text(line, margin + 10, yPosition);
              yPosition += 7;
            });
          }
          
          yPosition += 15;

          // SEÇÃO: EXPLICAÇÃO TÉCNICA
          pdf.setFillColor(orangeWarning[0], orangeWarning[1], orangeWarning[2]);
          pdf.rect(margin, yPosition - 3, pageWidth - (margin * 2), 15, 'F');
          
          pdf.setTextColor(white[0], white[1], white[2]);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('EXPLICACAO TECNICA', margin + 5, yPosition + 8);
          yPosition += 20;

          // Extrair explicação
          const explanationMatch = formulaBlock.match(/\*\*Explicação:\*\*([\s\S]*?)(?=\*\*\d+\.|$)/);
          if (explanationMatch) {
            const explanation = explanationMatch[1].trim();
            
            pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            
            const lines = pdf.splitTextToSize(explanation, maxWidth - 10);
            
            lines.forEach((line: string) => {
              if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(line, margin + 5, yPosition);
              yPosition += 7;
            });
          }
          
          yPosition += 20;
        });

        // Adicionar seções finais se existirem
        const benefitsMatch = content.match(/\*\*Benefícios Gerais das Fórmulas:\*\*([\s\S]*?)(?=\*\*|$)/);
        const importanceMatch = content.match(/\*\*Importância do Uso em Conjunto:\*\*([\s\S]*?)(?=\*\*|$)/);
        const instructionsMatch = content.match(/\*\*Instruções de Uso Personalizadas:\*\*([\s\S]*?)(?=\*\*|$)/);

        if (benefitsMatch || importanceMatch || instructionsMatch) {
          // Verificar se precisa de nova página
          if (yPosition > pageHeight - 100) {
            pdf.addPage();
            yPosition = margin;
          }

          // Linha separadora
          pdf.setDrawColor(greenAccent[0], greenAccent[1], greenAccent[2]);
          pdf.setLineWidth(1);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15;

          // Processar cada seção
          const sections = [
            { match: benefitsMatch, title: 'BENEFICIOS GERAIS' },
            { match: importanceMatch, title: 'IMPORTANCIA DO USO EM CONJUNTO' },
            { match: instructionsMatch, title: 'INSTRUCOES DE USO' }
          ];

          sections.forEach(section => {
            if (section.match) {
              pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
              pdf.rect(margin, yPosition - 3, pageWidth - (margin * 2), 15, 'F');
              
              pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
              pdf.setFontSize(12);
              pdf.setFont('helvetica', 'bold');
              pdf.text(section.title, margin + 5, yPosition + 8);
              yPosition += 20;

              const sectionContent = section.match[1].trim();
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(10);
              
              const lines = pdf.splitTextToSize(sectionContent, maxWidth - 10);
              lines.forEach((line: string) => {
                if (yPosition > pageHeight - 40) {
                  pdf.addPage();
                  yPosition = margin;
                }
                pdf.text(line, margin + 5, yPosition);
                yPosition += 7;
              });
              
              yPosition += 15;
            }
          });
        }
      } else {
        // Fallback para análises sem estrutura de fórmulas
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const lines = pdf.splitTextToSize(content, maxWidth - 10);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 7;
        });
        
        yPosition += 20;
      }
    });
  }

  // Footer profissional
  const footerY = pageHeight - 40;
  
  // Caixa do footer
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(0, footerY - 5, pageWidth, 45, 'F');
  
  // Linha superior do footer
  pdf.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.setLineWidth(1);
  pdf.line(0, footerY - 5, pageWidth, footerY - 5);
  
  // Textos do footer
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  const disclaimerTitle = 'IMPORTANTE - LEIA ATENTAMENTE';
  pdf.text(disclaimerTitle, margin, footerY + 5);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  const disclaimer1 = 'Este documento contem analise farmaceutica especializada para fins informativos e educacionais.';
  const disclaimer2 = 'Consulte sempre um farmaceutico ou medico antes de utilizar qualquer formulacao medicamentosa.';
  const disclaimer3 = 'A responsabilidade pela prescricao e uso e exclusiva do profissional habilitado.';
  
  pdf.text(disclaimer1, margin, footerY + 12);
  pdf.text(disclaimer2, margin, footerY + 18);
  pdf.text(disclaimer3, margin, footerY + 24);
  
  // Assinatura digital
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Formula.AI | Tecnologia Farmaceutica Avancada', margin, footerY + 32);
  
  // Número da página em todas as páginas
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${i}/${pageCount}`, pageWidth - 25, pageHeight - 10);
  }

  // Gerar nome do arquivo com timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `prescricao-farmaceutica-${timestamp}.pdf`;
  
  pdf.save(filename);
};
