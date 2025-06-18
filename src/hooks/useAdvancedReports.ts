
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  fetchFinancialMetricsApi,
  fetchDoctorPerformanceApi,
  fetchFormulaStatisticsApi,
  generateReportApi,
  updateReportStatusApi,
  fetchGeneratedReportsApi
} from '@/services/reportsApi';
import type {
  FinancialMetric,
  DoctorPerformance,
  FormulaStatistic,
  GeneratedReport,
  ReportFilters
} from '@/types/reports';

export const useAdvancedReports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([]);
  const [doctorPerformance, setDoctorPerformance] = useState<DoctorPerformance[]>([]);
  const [formulaStatistics, setFormulaStatistics] = useState<FormulaStatistic[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  const fetchFinancialMetrics = async (filters?: { startDate?: string; endDate?: string }) => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      const data = await fetchFinancialMetricsApi(profile.organization_id, filters);
      setFinancialMetrics(data);
    } catch (error) {
      console.error('Erro ao buscar métricas financeiras:', error);
      toast({
        title: "Erro ao carregar métricas financeiras",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorPerformance = async (filters?: { startMonth?: string; endMonth?: string }) => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      const data = await fetchDoctorPerformanceApi(profile.organization_id, filters);
      setDoctorPerformance(data);
    } catch (error) {
      console.error('Erro ao buscar performance dos médicos:', error);
      toast({
        title: "Erro ao carregar performance dos médicos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormulaStatistics = async (filters?: { startMonth?: string; endMonth?: string }) => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      const data = await fetchFormulaStatisticsApi(profile.organization_id, filters);
      setFormulaStatistics(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de fórmulas:', error);
      toast({
        title: "Erro ao carregar estatísticas de fórmulas",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (filters: ReportFilters, reportName: string) => {
    if (!profile?.organization_id || !profile?.id) return;

    setIsLoading(true);
    try {
      const data = await generateReportApi(profile.organization_id, profile.id, filters, reportName);

      toast({
        title: "Relatório sendo gerado",
        description: "Você será notificado quando estiver pronto.",
      });

      // Simular geração do relatório
      setTimeout(async () => {
        await updateReportStatusApi(data.id, 'completed', `https://example.com/reports/${data.id}.pdf`);
        fetchGeneratedReports();
        toast({
          title: "Relatório gerado com sucesso!",
          description: "Você pode baixá-lo na lista de relatórios.",
        });
      }, 3000);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeneratedReports = async () => {
    if (!profile?.organization_id) return;

    try {
      const data = await fetchGeneratedReportsApi(profile.organization_id);
      setGeneratedReports(data);
    } catch (error) {
      console.error('Erro ao buscar relatórios gerados:', error);
    }
  };

  useEffect(() => {
    if (profile?.organization_id) {
      fetchGeneratedReports();
    }
  }, [profile?.organization_id]);

  return {
    isLoading,
    financialMetrics,
    doctorPerformance,
    formulaStatistics,
    generatedReports,
    fetchFinancialMetrics,
    fetchDoctorPerformance,
    fetchFormulaStatistics,
    generateReport
  };
};
