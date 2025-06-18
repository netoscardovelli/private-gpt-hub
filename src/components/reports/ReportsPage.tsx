
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdvancedReports } from '@/hooks/useAdvancedReports';
import { BarChart3, FileText, Download, TrendingUp, Users, Calculator, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportsPage = () => {
  const {
    isLoading,
    financialMetrics,
    doctorPerformance,
    formulaStatistics,
    generatedReports,
    fetchFinancialMetrics,
    fetchDoctorPerformance,
    fetchFormulaStatistics,
    generateReport
  } = useAdvancedReports();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'financial',
    reportName: ''
  });

  const handleGenerateReport = () => {
    if (!filters.reportName) {
      return;
    }
    generateReport(filters, filters.reportName);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Avançados</h1>
          <p className="text-muted-foreground">
            Gere e visualize relatórios detalhados sobre sua farmácia
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchFinancialMetrics()} disabled={isLoading}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Atualizar Dados
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="doctors">Médicos</TabsTrigger>
          <TabsTrigger value="formulas">Fórmulas</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Gerador de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="reportName">Nome do Relatório</Label>
                  <Input
                    id="reportName"
                    placeholder="Ex: Relatório Mensal Janeiro"
                    value={filters.reportName}
                    onChange={(e) => setFilters({ ...filters, reportName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="reportType">Tipo de Relatório</Label>
                  <Select
                    value={filters.reportType}
                    onValueChange={(value) => setFilters({ ...filters, reportType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="doctors">Performance Médicos</SelectItem>
                      <SelectItem value="formulas">Estatísticas Fórmulas</SelectItem>
                      <SelectItem value="complete">Relatório Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={isLoading || !filters.reportName}
                className="w-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Relatórios Gerados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedReports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum relatório gerado ainda
                  </p>
                ) : (
                  generatedReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{report.report_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tipo: {report.report_type} • Criado em {formatDate(report.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                          {report.status === 'completed' ? 'Concluído' : 'Gerando...'}
                        </Badge>
                        {report.status === 'completed' && report.file_url && (
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(financialMetrics.reduce((sum, metric) => sum + metric.total_revenue, 0))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Fórmulas</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {financialMetrics.reduce((sum, metric) => sum + metric.total_formulas, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    financialMetrics.length > 0
                      ? financialMetrics.reduce((sum, metric) => sum + metric.average_formula_value, 0) / financialMetrics.length
                      : 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {financialMetrics.length > 0
                    ? `${(financialMetrics.reduce((sum, metric) => sum + metric.growth_rate, 0) / financialMetrics.length).toFixed(1)}%`
                    : '0%'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialMetrics.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum dado financeiro disponível
                  </p>
                ) : (
                  financialMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{formatDate(metric.date)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {metric.total_formulas} fórmulas • Categoria: {metric.top_category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(metric.total_revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          Média: {formatCurrency(metric.average_formula_value)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Performance dos Médicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctorPerformance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum dado de performance disponível
                  </p>
                ) : (
                  doctorPerformance.map((performance) => (
                    <div key={performance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Médico ID: {performance.doctor_id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {performance.month_year} • {performance.total_prescriptions} prescrições
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{performance.unique_formulas} fórmulas únicas</p>
                        <p className="text-sm text-muted-foreground">
                          Satisfação: {performance.patient_satisfaction.toFixed(1)}/5.0
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Estatísticas de Fórmulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formulaStatistics.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma estatística de fórmula disponível
                  </p>
                ) : (
                  formulaStatistics.map((stat) => (
                    <div key={stat.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Fórmula ID: {stat.formula_id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stat.month_year} • {stat.prescription_count} prescrições
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(stat.total_revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.unique_doctors} médicos • {stat.success_rate}% sucesso
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
