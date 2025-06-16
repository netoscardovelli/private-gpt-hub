
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

  // Título
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Análise de Fórmulas - Formula.AI', margin, yPosition);
  yPosition += 15;

  // Data
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
  yPosition += 20;

  messages.forEach((message, index) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    // Cabeçalho da mensagem
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const sender = message.role === 'user' ? 'Usuário' : 'Assistente';
    const time = message.timestamp.toLocaleTimeString('pt-BR');
    pdf.text(`${sender} - ${time}`, margin, yPosition);
    yPosition += 10;

    // Conteúdo da mensagem
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Quebrar texto em linhas
    const lines = pdf.splitTextToSize(message.content, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10; // Espaço entre mensagens
  });

  // Salvar o PDF
  const filename = `analise-formulas-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
