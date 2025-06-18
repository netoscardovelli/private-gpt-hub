
-- Adicionar organization_id nas tabelas que faltam para isolamento completo

-- 1. Tabela analysis_feedback - adicionar organization_id
ALTER TABLE public.analysis_feedback 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Atualizar registros existentes com organization_id dos usuários
UPDATE public.analysis_feedback 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = analysis_feedback.user_id
);

-- 2. Tabela doctor_profiles - adicionar organization_id
ALTER TABLE public.doctor_profiles 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Atualizar registros existentes com organization_id dos usuários
UPDATE public.doctor_profiles 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = doctor_profiles.user_id
);

-- 3. Tabela usage_stats - adicionar organization_id
ALTER TABLE public.usage_stats 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Atualizar registros existentes com organization_id dos usuários
UPDATE public.usage_stats 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = usage_stats.user_id
);

-- 4. Tabela reference_formulas - adicionar organization_id para fórmulas personalizadas
ALTER TABLE public.reference_formulas 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- 5. Criar tabela de convites para médicos
CREATE TABLE public.doctor_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  invitation_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- 6. Criar tabela de fórmulas favoritas por organização
CREATE TABLE public.organization_favorite_formulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  formula_id UUID NOT NULL REFERENCES public.reference_formulas(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, formula_id)
);

-- 7. Atualizar políticas RLS para analysis_feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.analysis_feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON public.analysis_feedback;

ALTER TABLE public.analysis_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view feedback" 
  ON public.analysis_feedback 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create feedback" 
  ON public.analysis_feedback 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- 8. Atualizar políticas RLS para doctor_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.doctor_profiles;

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view doctor profiles" 
  ON public.doctor_profiles 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create doctor profiles" 
  ON public.doctor_profiles 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update doctor profiles" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- 9. Atualizar políticas RLS para usage_stats
DROP POLICY IF EXISTS "Users can view their own stats" ON public.usage_stats;
DROP POLICY IF EXISTS "Users can create their own stats" ON public.usage_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.usage_stats;

ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view usage stats" 
  ON public.usage_stats 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create usage stats" 
  ON public.usage_stats 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update usage stats" 
  ON public.usage_stats 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- 10. Políticas RLS para doctor_invitations
ALTER TABLE public.doctor_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can manage invitations" 
  ON public.doctor_invitations 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

CREATE POLICY "Anyone can view their own invitation" 
  ON public.doctor_invitations 
  FOR SELECT 
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- 11. Políticas RLS para organization_favorite_formulas
ALTER TABLE public.organization_favorite_formulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view favorite formulas" 
  ON public.organization_favorite_formulas 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage favorite formulas" 
  ON public.organization_favorite_formulas 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- 12. Atualizar políticas RLS para reference_formulas (permitir fórmulas globais e por organização)
DROP POLICY IF EXISTS "Anyone can view formulas" ON public.reference_formulas;

ALTER TABLE public.reference_formulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view global formulas" 
  ON public.reference_formulas 
  FOR SELECT 
  USING (organization_id IS NULL);

CREATE POLICY "Organization members can view their formulas" 
  ON public.reference_formulas 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage their formulas" 
  ON public.reference_formulas 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

-- 13. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_organization_id ON public.analysis_feedback(organization_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_organization_id ON public.doctor_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_organization_id ON public.usage_stats(organization_id);
CREATE INDEX IF NOT EXISTS idx_reference_formulas_organization_id ON public.reference_formulas(organization_id);
CREATE INDEX IF NOT EXISTS idx_doctor_invitations_organization_id ON public.doctor_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_doctor_invitations_token ON public.doctor_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_doctor_invitations_email ON public.doctor_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_favorite_formulas_org_id ON public.organization_favorite_formulas(organization_id);
