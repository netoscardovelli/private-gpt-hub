
-- Garantir que RLS está habilitado na tabela doctor_invitations
ALTER TABLE public.doctor_invitations ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "view_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "create_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "update_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "delete_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "organization_members_can_view_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "organization_admins_can_create_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "organization_admins_can_update_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "organization_admins_can_delete_invitations" ON public.doctor_invitations;

-- Criar políticas RLS corretas para doctor_invitations
CREATE POLICY "Users can view organization invitations" ON public.doctor_invitations
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

CREATE POLICY "Users can create organization invitations" ON public.doctor_invitations
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

CREATE POLICY "Users can update organization invitations" ON public.doctor_invitations
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

CREATE POLICY "Users can delete organization invitations" ON public.doctor_invitations
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

-- Política adicional para permitir que qualquer pessoa veja convites pelo token (para aceitar convites)
CREATE POLICY "Anyone can view invitation by token" ON public.doctor_invitations
  FOR SELECT 
  TO authenticated
  USING (true);
