
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  category?: string;
  reportType: string;
  [key: string]: any;
}

interface FinancialMetric {
  id: string;
  date: string;
  total_revenue: number;
  total_formulas: number;
  average_formula_value: number;
  top_category: string;
  growth_rate: number;
}

interface DoctorPerformance {
  id: string;
  doctor_id: string;
  month_year: string;
  total_prescriptions: number;
  unique_formulas: number;
  patient_satisfaction: number;
  average_formula_complexity: number;
  specialties_covered: string[];
}

interface FormulaStatistic {
  id: string;
  formula_id: string;
  month_year: string;
  prescription_count: number;
  total_revenue: number;
  unique_doctors: number;
  average_rating: number;
  success_rate: number;
}

interface GeneratedReport {
  id: string;
  report_type: string;
  report_name: string;
  status: string;
  file_url?: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

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
      let query = supabase
        .from('financial_metrics')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFinancialMetrics(data || []);
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
      let query = supabase
        .from('doctor_performance')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('month_year', { ascending: false });

      if (filters?.startMonth) {
        query = query.gte('month_year', filters.startMonth);
      }
      if (filters?.endMonth) {
        query = query.lte('month_year', filters.endMonth);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        specialties_covered: Array.isArray(item.specialties_covered) 
          ? item.specialties_covered as string[]
          : []
      })) || [];

      setDoctorPerformance(transformedData);
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
      let query = supabase
        .from('formula_statistics')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('prescription_count', { ascending: false });

      if (filters?.startMonth) {
        query = query.gte('month_year', filters.startMonth);
      }
      if (filters?.endMonth) {
        query = query.lte('month_year', filters.endMonth);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFormulaStatistics(data || []);
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
      const { data, error } = await supabase
        .from('generated_reports')
        .insert({
          organization_id: profile.organization_id,
          user_id: profile.id,
          report_type: filters.reportType,
          report_name: reportName,
          filters: filters as any,
          status: 'generating'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Relatório sendo gerado",
        description: "Você será notificado quando estiver pronto.",
      });

      // Simular geração do relatório
      setTimeout(async () => {
        await supabase
          .from('generated_reports')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            file_url: `https://example.com/reports/${data.id}.pdf`
          })
          .eq('id', data.id);

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
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGeneratedReports(data || []);
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
