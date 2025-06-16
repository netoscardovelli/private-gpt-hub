
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
  const primaryBlue = [41, 98, 255];
  const darkGray = [51, 65, 85];
  const lightGray = [148, 163, 184];
  const greenAccent = [16, 185, 129];

  // Header profissional
  pdf.setFillColor(...primaryBlue);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo/Título principal
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FÓRMULA MAGISTRAL', margin, 20);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Análise Farmacêutica Especializada', margin, 28);

  // Data e informações do documento
  yPosition = 50;
  pdf.setTextColor(...darkGray);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.text(`Emitido em: ${currentDate}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Documento gerado via Formula.AI - Sistema de Análise Farmacêutica`, margin, yPosition);
  yPosition += 20;

  // Linha separadora
  pdf.setDrawColor(...lightGray);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Processar mensagens
  const analysisMessages = messages.filter(msg => msg.role === 'assistant' && msg.content.length > 100);
  
  analysisMessages.forEach((message, index) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    // Título da seção
    pdf.setTextColor(...primaryBlue);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`ANÁLISE FARMACÊUTICA ${index + 1}`, margin, yPosition);
    yPosition += 12;

    // Linha decorativa
    pdf.setFillColor(...greenAccent);
    pdf.rect(margin, yPosition - 2, 40, 1, 'F');
    yPosition += 8;

    // Conteúdo da análise
    pdf.setTextColor(...darkGray);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Processar o texto para destacar seções importantes
    const content = message.content;
    const lines = pdf.splitTextToSize(content, maxWidth - 10);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        yPosition = margin;
      }

      // Destacar títulos com bullet points
      if (line.includes('•') || line.includes('▪') || line.includes('-')) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryBlue);
      } 
      // Destacar avisos importantes
      else if (line.toLowerCase().includes('atenção') || 
               line.toLowerCase().includes('importante') || 
               line.toLowerCase().includes('cuidado')) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(220, 38, 38); // Vermelho para alertas
      }
      // Texto normal
      else {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...darkGray);
      }
      
      pdf.text(line, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 15; // Espaço entre análises
  });

  // Footer profissional
  const footerY = pageHeight - 30;
  
  // Linha separadora do footer
  pdf.setDrawColor(...lightGray);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY, pageWidth - margin, footerY);
  
  // Informações do footer
  pdf.setTextColor(...lightGray);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  const footerText1 = 'Este documento contém análise farmacêutica especializada para fins educacionais e informativos.';
  const footerText2 = 'Consulte sempre um farmacêutico ou médico antes de utilizar qualquer formulação.';
  const footerText3 = 'Formula.AI - Tecnologia a serviço da farmácia magistral';
  
  pdf.text(footerText1, margin, footerY + 8);
  pdf.text(footerText2, margin, footerY + 14);
  
  // Logo/marca no footer
  pdf.setTextColor(...primaryBlue);
  pdf.setFont('helvetica', 'bold');
  pdf.text(footerText3, margin, footerY + 22);
  
  // Número da página
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setTextColor(...lightGray);
    pdf.setFontSize(8);
    pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 40, pageHeight - 10);
  }

  // Salvar o PDF com nome profissional
  const filename = `analise-farmaceutica-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
