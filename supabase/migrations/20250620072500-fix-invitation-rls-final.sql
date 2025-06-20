
-- Corrigir definitivamente as políticas RLS para doctor_invitations

-- Primeiro, remover TODAS as políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "view_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "create_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "update_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "delete_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Users can view organization invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Users can create organization invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Users can update organization invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Users can delete organization invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token for validation" ON public.doctor_invitations;

-- Garantir que RLS está habilitado
ALTER TABLE public.doctor_invitations ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Permitir acesso público aos convites pelo token (para validação de convites)
CREATE POLICY "public_token_access" ON public.doctor_invitations
  FOR SELECT 
  TO anon, authenticated
  USING (invitation_token IS NOT NULL);

-- POLÍTICA 2: Permitir que membros da organização vejam convites da sua organização
CREATE POLICY "organization_members_view" ON public.doctor_invitations
  FOR SELECT 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id IS NOT NULL
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

-- POLÍTICA 3: Permitir que admins criem convites
CREATE POLICY "organization_admins_create" ON public.doctor_invitations
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id IS NOT NULL
      AND role IN ('admin', 'super_admin', 'owner')
    )
    AND invited_by = auth.uid()
  );

-- POLÍTICA 4: Permitir que admins atualizem convites
CREATE POLICY "organization_admins_update" ON public.doctor_invitations
  FOR UPDATE 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id IS NOT NULL
      AND role IN ('admin', 'super_admin', 'owner')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id IS NOT NULL
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

-- POLÍTICA 5: Permitir que admins deletem convites
CREATE POLICY "organization_admins_delete" ON public.doctor_invitations
  FOR DELETE 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id IS NOT NULL
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );
