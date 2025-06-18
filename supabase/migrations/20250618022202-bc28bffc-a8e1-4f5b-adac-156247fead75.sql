
-- Criar tabela para parceiros da API
CREATE TABLE public.api_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 1000,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  total_requests INTEGER DEFAULT 0,
  contact_person TEXT,
  description TEXT
);

-- Criar tabela para tracking de uso da API
CREATE TABLE public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.api_partners(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  requests_count INTEGER NOT NULL DEFAULT 1,
  last_request TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT
);

-- Criar tabela para métricas de chat
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  specialty TEXT,
  total_tokens_used INTEGER DEFAULT 0,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para mensagens do chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  formula_detected BOOLEAN DEFAULT false,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados de exemplo para fórmulas de referência
INSERT INTO public.reference_formulas (name, description, category, specialty, pharmaceutical_form, clinical_indication) VALUES
('Fórmula Antioxidante Premium', 'Combinação potente de antioxidantes para proteção celular', 'Antioxidantes', 'ortomolecular', 'Cápsula', 'Estresse oxidativo, envelhecimento'),
('Complexo Nootrópico', 'Fórmula para melhora cognitiva e foco mental', 'Nootrópicos', 'neurologia', 'Cápsula', 'Déficit de atenção, performance cognitiva'),
('Anti-inflamatório Natural', 'Combinação de ativos anti-inflamatórios naturais', 'Anti-inflamatórios', 'reumatologia', 'Cápsula', 'Inflamação crônica, dores articulares'),
('Emagrecimento Avançado', 'Fórmula termogênica para perda de peso', 'Emagrecimento', 'endocrinologia', 'Cápsula', 'Obesidade, sobrepeso'),
('Ansiolítico Natural', 'Combinação de fitoterápicos para ansiedade', 'Ansiolíticos', 'psiquiatria', 'Cápsula', 'Ansiedade, estresse'),
('Hepatoprotetor', 'Proteção e regeneração hepática', 'Hepatoprotetores', 'gastroenterologia', 'Cápsula', 'Disfunção hepática, detox');

-- Inserir ativos para as fórmulas (usando uma abordagem mais simples)
DO $$
DECLARE
    formula_antioxidante_id UUID;
    formula_nootropico_id UUID;
    formula_antiinflamatorio_id UUID;
    formula_emagrecimento_id UUID;
    formula_ansiolitico_id UUID;
    formula_hepatoprotetor_id UUID;
BEGIN
    -- Obter IDs das fórmulas
    SELECT id INTO formula_antioxidante_id FROM public.reference_formulas WHERE name = 'Fórmula Antioxidante Premium';
    SELECT id INTO formula_nootropico_id FROM public.reference_formulas WHERE name = 'Complexo Nootrópico';
    SELECT id INTO formula_antiinflamatorio_id FROM public.reference_formulas WHERE name = 'Anti-inflamatório Natural';
    SELECT id INTO formula_emagrecimento_id FROM public.reference_formulas WHERE name = 'Emagrecimento Avançado';
    SELECT id INTO formula_ansiolitico_id FROM public.reference_formulas WHERE name = 'Ansiolítico Natural';
    SELECT id INTO formula_hepatoprotetor_id FROM public.reference_formulas WHERE name = 'Hepatoprotetor';

    -- Inserir ativos da Fórmula Antioxidante Premium
    INSERT INTO public.reference_formula_actives (formula_id, active_name, concentration_mg, role_in_formula, concentration_text) VALUES
    (formula_antioxidante_id, 'Resveratrol', 100, 'Antioxidante principal', '100mg'),
    (formula_antioxidante_id, 'Coenzima Q10', 50, 'Proteção mitocondrial', '50mg'),
    (formula_antioxidante_id, 'Vitamina E', 200, 'Antioxidante lipossolúvel', '200UI');

    -- Inserir ativos do Complexo Nootrópico
    INSERT INTO public.reference_formula_actives (formula_id, active_name, concentration_mg, role_in_formula, concentration_text) VALUES
    (formula_nootropico_id, 'Piracetam', 800, 'Nootrópico principal', '800mg'),
    (formula_nootropico_id, 'Colina', 250, 'Precursor acetilcolina', '250mg'),
    (formula_nootropico_id, 'Bacopa Monnieri', 150, 'Melhora memória', '150mg');

    -- Inserir ativos do Anti-inflamatório Natural
    INSERT INTO public.reference_formula_actives (formula_id, active_name, concentration_mg, role_in_formula, concentration_text) VALUES
    (formula_antiinflamatorio_id, 'Cúrcuma', 500, 'Anti-inflamatório', '500mg'),
    (formula_antiinflamatorio_id, 'Boswellia', 300, 'Anti-inflamatório', '300mg'),
    (formula_antiinflamatorio_id, 'Gengibre', 200, 'Anti-inflamatório', '200mg');

    -- Inserir ativos do Emagrecimento Avançado
    INSERT INTO public.reference_formula_actives (formula_id, active_name, concentration_mg, role_in_formula, concentration_text) VALUES
    (formula_emagrecimento_id, 'Cafeína', 200, 'Termogênico', '200mg'),
    (formula_emagrecimento_id, 'Chá Verde', 300, 'Queimador de gordura', '300mg'),
    (formula_emagrecimento_id, 'L-Carnitina', 500, 'Metabolismo lipídico', '500mg');

    -- Inserir ativos do Ansiolítico Natural
    INSERT INTO public.reference_formula_actives (formula_id, active_name, concentration_mg, role_in_formula, concentration_text) VALUES
    (formula_ansiolitico_id, 'Passiflora', 200, 'Ansiolítico', '200mg'),
    (formula_ansiolitico_id, 'Valeriana', 300, 'Sedativo', '300mg'),
    (formula_ansiolitico_id, 'Melissa', 150, 'Calmante', '150mg');

    -- Inserir ativos do Hepatoprotetor
    INSERT INTO public.reference_formula_actives (formula_id, active_name, concentration_mg, role_in_formula, concentration_text) VALUES
    (formula_hepatoprotetor_id, 'Silimarina', 150, 'Hepatoprotetor', '150mg'),
    (formula_hepatoprotetor_id, 'Alcachofra', 200, 'Colerético', '200mg'),
    (formula_hepatoprotetor_id, 'Cardo Mariano', 100, 'Regeneração hepática', '100mg');
END $$;

-- Inserir dados de exemplo para incompatibilidades
INSERT INTO public.active_incompatibilities (active_1, active_2, incompatibility_type, severity, notes) VALUES
('Varfarina', 'Vitamina K', 'Antagonismo farmacológico', 'Alta', 'Vitamina K antagoniza efeito anticoagulante da varfarina'),
('Lítio', 'Cafeína', 'Interação farmacocinética', 'Média', 'Cafeína pode aumentar excreção renal do lítio'),
('Ferro', 'Cálcio', 'Competição por absorção', 'Baixa', 'Cálcio pode reduzir absorção de ferro'),
('Digoxina', 'Erva de São João', 'Indução enzimática', 'Alta', 'Erva de São João induz CYP3A4 reduzindo níveis de digoxina'),
('Warfarina', 'Ginkgo Biloba', 'Potencialização', 'Alta', 'Ambos têm efeito anticoagulante'),
('Insulina', 'Cromo', 'Potencialização', 'Média', 'Cromo pode potencializar efeito hipoglicemiante');

-- Inserir alguns parceiros de API de exemplo
INSERT INTO public.api_partners (name, email, contact_person, description, rate_limit_per_hour) VALUES
('FarmaTech Solutions', 'contato@farmatech.com', 'Dr. João Silva', 'Empresa de tecnologia para farmácias', 5000),
('MedSystem', 'api@medsystem.com', 'Ana Costa', 'Sistema de gestão médica', 3000),
('PharmaCorp', 'dev@pharmacorp.com', 'Carlos Santos', 'Corporação farmacêutica', 10000);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.api_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para api_partners (apenas admins podem ver)
CREATE POLICY "Admins can manage API partners" ON public.api_partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Políticas RLS para api_usage (apenas admins podem ver)
CREATE POLICY "Admins can view API usage" ON public.api_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Políticas RLS para chat_sessions
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para chat_messages
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas as sessões e mensagens para analytics
CREATE POLICY "Admins can view all chat sessions" ON public.chat_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
