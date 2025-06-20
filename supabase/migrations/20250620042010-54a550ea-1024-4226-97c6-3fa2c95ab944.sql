
-- Corrigir políticas RLS da tabela doctor_invitations

-- Primeiro, remover todas as políticas existentes
DROP POLICY IF EXISTS "view_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "create_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "update_organization_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "delete_organization_invitations" ON public.doctor_invitations;

-- Garantir que RLS está habilitado
ALTER TABLE public.doctor_invitations ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - permitir visualizar convites da própria organização
CREATE POLICY "organization_members_can_view_invitations" ON public.doctor_invitations
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id = doctor_invitations.organization_id
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

-- Política para INSERT - permitir criar convites se for admin da organização
CREATE POLICY "organization_admins_can_create_invitations" ON public.doctor_invitations
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id = doctor_invitations.organization_id
      AND role IN ('admin', 'super_admin', 'owner')
    )
    AND invited_by = auth.uid()
  );

-- Política para UPDATE - permitir atualizar convites da própria organização
CREATE POLICY "organization_admins_can_update_invitations" ON public.doctor_invitations
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id = doctor_invitations.organization_id
      AND role IN ('admin', 'super_admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id = doctor_invitations.organization_id
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );

-- Política para DELETE - permitir deletar convites da própria organização
CREATE POLICY "organization_admins_can_delete_invitations" ON public.doctor_invitations
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND organization_id = doctor_invitations.organization_id
      AND role IN ('admin', 'super_admin', 'owner')
    )
  );
