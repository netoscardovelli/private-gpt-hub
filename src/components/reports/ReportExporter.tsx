
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { exportReportToPDF } from '@/utils/reportExporter';
import { useToast } from '@/hooks/use-toast';

interface ReportExporterProps {
  reportData: any;
  reportType: string;
  reportName: string;
}

const ReportExporter = ({ reportData, reportType, reportName }: ReportExporterProps) => {
  const { toast } = useToast();

  const handleExportPDF = async () => {
    try {
      await exportReportToPDF(reportData, reportType, reportName);
      toast({
        title: "Relatório exportado!",
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório em PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportPDF} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Exportar PDF
      </Button>
      <Button variant="outline">
        <FileText className="w-4 h-4 mr-2" />
        Exportar Excel
      </Button>
    </div>
  );
};

export default ReportExporter;
