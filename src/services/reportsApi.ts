
import { supabase } from '@/integrations/supabase/client';
import type { FinancialMetric, DoctorPerformance, FormulaStatistic, GeneratedReport, ReportFilters } from '@/types/reports';

export const fetchFinancialMetricsApi = async (
  organizationId: string,
  filters?: { startDate?: string; endDate?: string }
): Promise<FinancialMetric[]> => {
  let query = supabase
    .from('financial_metrics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const fetchDoctorPerformanceApi = async (
  organizationId: string,
  filters?: { startMonth?: string; endMonth?: string }
): Promise<DoctorPerformance[]> => {
  let query = supabase
    .from('doctor_performance')
    .select('*')
    .eq('organization_id', organizationId)
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

  return transformedData;
};

export const fetchFormulaStatisticsApi = async (
  organizationId: string,
  filters?: { startMonth?: string; endMonth?: string }
): Promise<FormulaStatistic[]> => {
  let query = supabase
    .from('formula_statistics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('prescription_count', { ascending: false });

  if (filters?.startMonth) {
    query = query.gte('month_year', filters.startMonth);
  }
  if (filters?.endMonth) {
    query = query.lte('month_year', filters.endMonth);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const generateReportApi = async (
  organizationId: string,
  userId: string,
  filters: ReportFilters,
  reportName: string
): Promise<GeneratedReport> => {
  const { data, error } = await supabase
    .from('generated_reports')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      report_type: filters.reportType,
      report_name: reportName,
      filters: filters as any,
      status: 'generating'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateReportStatusApi = async (
  reportId: string,
  status: string,
  fileUrl?: string
): Promise<void> => {
  const updateData: any = {
    status,
    completed_at: new Date().toISOString()
  };

  if (fileUrl) {
    updateData.file_url = fileUrl;
  }

  const { error } = await supabase
    .from('generated_reports')
    .update(updateData)
    .eq('id', reportId);

  if (error) throw error;
};

export const fetchGeneratedReportsApi = async (organizationId: string): Promise<GeneratedReport[]> => {
  const { data, error } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
