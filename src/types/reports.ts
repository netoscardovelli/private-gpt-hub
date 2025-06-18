
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  category?: string;
  reportType: string;
  [key: string]: any;
}

export interface FinancialMetric {
  id: string;
  date: string;
  total_revenue: number;
  total_formulas: number;
  average_formula_value: number;
  top_category: string;
  growth_rate: number;
}

export interface DoctorPerformance {
  id: string;
  doctor_id: string;
  month_year: string;
  total_prescriptions: number;
  unique_formulas: number;
  patient_satisfaction: number;
  average_formula_complexity: number;
  specialties_covered: string[];
}

export interface FormulaStatistic {
  id: string;
  formula_id: string;
  month_year: string;
  prescription_count: number;
  total_revenue: number;
  unique_doctors: number;
  average_rating: number;
  success_rate: number;
}

export interface GeneratedReport {
  id: string;
  report_type: string;
  report_name: string;
  status: string;
  file_url?: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}
