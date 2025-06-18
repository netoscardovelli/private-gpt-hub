
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportReportToPDF = async (reportData: any, reportType: string, reportName: string) => {
  const doc = new jsPDF();
  
  // Configurar fonte para suportar caracteres especiais
  doc.setFont('helvetica');
  
  // Título do relatório
  doc.setFontSize(20);
  doc.text(reportName, 20, 30);
  
  // Data de geração
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
  
  let yPosition = 60;
  
  switch (reportType) {
    case 'financial':
      exportFinancialReport(doc, reportData, yPosition);
      break;
    case 'doctors':
      exportDoctorsReport(doc, reportData, yPosition);
      break;
    case 'formulas':
      exportFormulasReport(doc, reportData, yPosition);
      break;
    case 'complete':
      exportCompleteReport(doc, reportData, yPosition);
      break;
    default:
      doc.text('Tipo de relatório não suportado', 20, yPosition);
  }
  
  // Salvar o PDF
  doc.save(`${reportName.replace(/\s+/g, '_')}.pdf`);
};

const exportFinancialReport = (doc: jsPDF, data: any[], yPosition: number) => {
  doc.setFontSize(16);
  doc.text('Relatório Financeiro', 20, yPosition);
  
  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text('Nenhum dado financeiro disponível', 20, yPosition + 20);
    return;
  }
  
  const tableData = data.map(metric => [
    new Date(metric.date).toLocaleDateString('pt-BR'),
    `R$ ${metric.total_revenue.toFixed(2)}`,
    metric.total_formulas.toString(),
    `R$ ${metric.average_formula_value.toFixed(2)}`,
    `${metric.growth_rate.toFixed(1)}%`,
    metric.top_category || 'N/A'
  ]);
  
  doc.autoTable({
    startY: yPosition + 20,
    head: [['Data', 'Receita Total', 'Total Fórmulas', 'Valor Médio', 'Crescimento', 'Categoria Top']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [63, 81,181] }
  });
};

const exportDoctorsReport = (doc: jsPDF, data: any[], yPosition: number) => {
  doc.setFontSize(16);
  doc.text('Relatório de Performance - Médicos', 20, yPosition);
  
  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text('Nenhum dado de performance disponível', 20, yPosition + 20);
    return;
  }
  
  const tableData = data.map(performance => [
    performance.doctor_id,
    performance.month_year,
    performance.total_prescriptions.toString(),
    performance.unique_formulas.toString(),
    performance.patient_satisfaction.toFixed(1),
    performance.average_formula_complexity.toFixed(1)
  ]);
  
  doc.autoTable({
    startY: yPosition + 20,
    head: [['ID Médico', 'Período', 'Prescrições', 'Fórmulas Únicas', 'Satisfação', 'Complexidade']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [63, 81,181] }
  });
};

const exportFormulasReport = (doc: jsPDF, data: any[], yPosition: number) => {
  doc.setFontSize(16);
  doc.text('Relatório de Estatísticas - Fórmulas', 20, yPosition);
  
  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text('Nenhuma estatística de fórmula disponível', 20, yPosition + 20);
    return;
  }
  
  const tableData = data.map(stat => [
    stat.formula_id,
    stat.month_year,
    stat.prescription_count.toString(),
    `R$ ${stat.total_revenue.toFixed(2)}`,
    stat.unique_doctors.toString(),
    `${stat.success_rate.toFixed(1)}%`
  ]);
  
  doc.autoTable({
    startY: yPosition + 20,
    head: [['ID Fórmula', 'Período', 'Prescrições', 'Receita', 'Médicos', 'Taxa Sucesso']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [63, 81,181] }
  });
};

const exportCompleteReport = (doc: jsPDF, data: any, yPosition: number) => {
  doc.setFontSize(16);
  doc.text('Relatório Completo', 20, yPosition);
  
  let currentY = yPosition + 20;
  
  if (data.financial && data.financial.length > 0) {
    exportFinancialReport(doc, data.financial, currentY);
    currentY += 100;
  }
  
  if (data.doctors && data.doctors.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 30;
    }
    exportDoctorsReport(doc, data.doctors, currentY);
    currentY += 100;
  }
  
  if (data.formulas && data.formulas.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 30;
    }
    exportFormulasReport(doc, data.formulas, currentY);
  }
};
