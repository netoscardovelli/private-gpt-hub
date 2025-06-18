
-- Primeiro, remover as políticas RLS existentes que dependem de user_id
DROP POLICY IF EXISTS "Users can view their own settings" ON public.system_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.system_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.system_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.system_settings;

-- Adicionar organization_id na tabela system_settings
ALTER TABLE public.system_settings 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Atualizar registros existentes para usar organization_id dos usuários
UPDATE public.system_settings 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = system_settings.user_id
);

-- Agora remover a coluna user_id
ALTER TABLE public.system_settings 
DROP COLUMN user_id;

-- Criar novas políticas RLS baseadas em organization_id
CREATE POLICY "Organization members can view settings" 
  ON public.system_settings 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can create settings" 
  ON public.system_settings 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

CREATE POLICY "Organization admins can update settings" 
  ON public.system_settings 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

CREATE POLICY "Organization admins can delete settings" 
  ON public.system_settings 
  FOR DELETE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );
