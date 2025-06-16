
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
  pdf.text('PRESCRIÇÃO FARMACÊUTICA', margin, 22);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Análise Técnica e Orientações Terapêuticas', margin, 32);

  // Informações do cabeçalho
  yPosition = 60;
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DOCUMENTO TÉCNICO FARMACÊUTICO', margin, yPosition);
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
  pdf.text('Sistema: Formula.AI - Análise Farmacêutica Especializada', margin, yPosition);
  yPosition += 20;

  // Linha separadora elegante
  pdf.setDrawColor(greenAccent[0], greenAccent[1], greenAccent[2]);
  pdf.setLineWidth(2);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // Filtrar mensagens relevantes para análise
  const analysisMessages = messages.filter(msg => 
    msg.role === 'assistant' && 
    msg.content.length > 100 &&
    !msg.content.includes('Olá') &&
    !msg.content.includes('Cole suas fórmulas')
  );

  if (analysisMessages.length === 0) {
    // Se não há análises, mostrar mensagem informativa
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Nenhuma análise farmacêutica foi realizada nesta sessão.', margin, yPosition);
    yPosition += 20;
  } else {
    // Processar análises
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
      pdf.text(`ANÁLISE TÉCNICA ${index + 1}`, margin + 5, yPosition + 8);
      yPosition += 25;

      // Conteúdo da análise
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const content = message.content;
      const lines = pdf.splitTextToSize(content, maxWidth - 10);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Destacar diferentes tipos de conteúdo
        if (line.includes('⚠') || line.includes('ATENÇÃO') || 
            line.toLowerCase().includes('cuidado') || 
            line.toLowerCase().includes('importante')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(redAlert[0], redAlert[1], redAlert[2]);
        } else if (line.includes('•') || line.includes('▪') || line.includes('-') || 
                   line.includes('✓') || line.includes('→')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        } else if (line.includes('COMPOSIÇÃO') || line.includes('POSOLOGIA') || 
                   line.includes('ORIENTAÇÕES') || line.includes('OBSERVAÇÕES')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        }
        
        pdf.text(line, margin + 5, yPosition);
        yPosition += 7;
      });
      
      yPosition += 20;
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
  const disclaimer1 = 'Este documento contém análise farmacêutica especializada para fins informativos e educacionais.';
  const disclaimer2 = 'Consulte sempre um farmacêutico ou médico antes de utilizar qualquer formulação medicamentosa.';
  const disclaimer3 = 'A responsabilidade pela prescrição e uso é exclusiva do profissional habilitado.';
  
  pdf.text(disclaimer1, margin, footerY + 12);
  pdf.text(disclaimer2, margin, footerY + 18);
  pdf.text(disclaimer3, margin, footerY + 24);
  
  // Assinatura digital
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Formula.AI | Tecnologia Farmacêutica Avançada', margin, footerY + 32);
  
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
