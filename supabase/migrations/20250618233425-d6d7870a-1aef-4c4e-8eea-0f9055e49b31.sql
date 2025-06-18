
-- Criar tabela para armazenar relatórios gerados
CREATE TABLE public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  report_name TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'generating',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Criar tabela para métricas financeiras
CREATE TABLE public.financial_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_formulas INTEGER DEFAULT 0,
  average_formula_value DECIMAL(10,2) DEFAULT 0,
  top_category TEXT,
  growth_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para performance de médicos
CREATE TABLE public.doctor_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- formato: "2024-01"
  total_prescriptions INTEGER DEFAULT 0,
  unique_formulas INTEGER DEFAULT 0,
  patient_satisfaction DECIMAL(3,2) DEFAULT 0,
  average_formula_complexity DECIMAL(3,2) DEFAULT 0,
  specialties_covered JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, doctor_id, month_year)
);

-- Criar tabela para estatísticas de fórmulas
CREATE TABLE public.formula_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  formula_id UUID NOT NULL,
  month_year TEXT NOT NULL,
  prescription_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  unique_doctors INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, formula_id, month_year)
);

-- Adicionar RLS para todas as tabelas
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para generated_reports
CREATE POLICY "Organization members can view their reports" 
  ON public.generated_reports FOR SELECT 
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Organization members can create reports" 
  ON public.generated_reports FOR INSERT 
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Políticas RLS para financial_metrics
CREATE POLICY "Organization members can view financial metrics" 
  ON public.financial_metrics FOR SELECT 
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage financial metrics" 
  ON public.financial_metrics FOR ALL 
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'owner')
  ));

-- Políticas RLS para doctor_performance
CREATE POLICY "Organization members can view doctor performance" 
  ON public.doctor_performance FOR SELECT 
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage doctor performance" 
  ON public.doctor_performance FOR ALL 
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'owner')
  ));

-- Políticas RLS para formula_statistics
CREATE POLICY "Organization members can view formula statistics" 
  ON public.formula_statistics FOR SELECT 
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage formula statistics" 
  ON public.formula_statistics FOR ALL 
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'owner')
  ));
