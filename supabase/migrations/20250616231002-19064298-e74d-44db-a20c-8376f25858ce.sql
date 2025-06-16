
-- Tabela para armazenar fórmulas de referência
CREATE TABLE public.reference_formulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- ex: 'hipertrofia', 'emagrecimento', 'anti-aging', etc
  pharmaceutical_form TEXT NOT NULL, -- 'capsula', 'po', 'sache', 'creme', etc
  target_dosage_per_day INTEGER DEFAULT 1, -- quantas doses por dia
  total_weight_mg INTEGER, -- peso total estimado da formulação
  capsules_per_dose INTEGER, -- quantas cápsulas por dose (se aplicável)
  specialty TEXT DEFAULT 'geral', -- especialidade médica relacionada
  description TEXT,
  clinical_indication TEXT, -- indicação clínica
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para os ativos de cada fórmula
CREATE TABLE public.reference_formula_actives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formula_id UUID REFERENCES public.reference_formulas(id) ON DELETE CASCADE,
  active_name TEXT NOT NULL,
  concentration_mg DECIMAL(10,2) NOT NULL,
  concentration_text TEXT, -- ex: "500mg", "2g", "0.5%"
  role_in_formula TEXT, -- ex: 'principal', 'sinergico', 'adjuvante'
  mechanism_notes TEXT, -- notas sobre mecanismo de ação
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para armazenar padrões de incompatibilidades conhecidas
CREATE TABLE public.active_incompatibilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  active_1 TEXT NOT NULL,
  active_2 TEXT NOT NULL,
  incompatibility_type TEXT NOT NULL, -- 'fisica', 'quimica', 'farmacologica'
  severity TEXT NOT NULL, -- 'alta', 'media', 'baixa'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_reference_formulas_category ON public.reference_formulas(category);
CREATE INDEX idx_reference_formulas_specialty ON public.reference_formulas(specialty);
CREATE INDEX idx_reference_formulas_form ON public.reference_formulas(pharmaceutical_form);
CREATE INDEX idx_formula_actives_formula_id ON public.reference_formula_actives(formula_id);
CREATE INDEX idx_formula_actives_name ON public.reference_formula_actives(active_name);
CREATE INDEX idx_incompatibilities_actives ON public.active_incompatibilities(active_1, active_2);

-- Habilitar RLS (essas tabelas podem ser públicas para leitura, mas apenas admins podem editar)
ALTER TABLE public.reference_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_formula_actives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_incompatibilities ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública mas escrita apenas para usuários autenticados
CREATE POLICY "Anyone can view reference formulas" 
  ON public.reference_formulas 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage reference formulas" 
  ON public.reference_formulas 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view formula actives" 
  ON public.reference_formula_actives 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage formula actives" 
  ON public.reference_formula_actives 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view incompatibilities" 
  ON public.active_incompatibilities 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage incompatibilities" 
  ON public.active_incompatibilities 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
