
-- Corrigir políticas RLS da tabela doctor_invitations

-- Primeiro, remover todas as políticas existentes
DROP POLICY IF EXISTS "users_can_view_organization_doctor_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "users_can_create_doctor_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "users_can_update_organization_doctor_invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Organization admins can manage invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Anyone can view their own invitation" ON public.doctor_invitations;

-- Garantir que RLS está habilitado
ALTER TABLE public.doctor_invitations ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - permitir visualizar convites da própria organização
CREATE POLICY "view_organization_invitations" ON public.doctor_invitations
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

-- Política para INSERT - permitir criar convites se for admin da organização
CREATE POLICY "create_organization_invitations" ON public.doctor_invitations
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

-- Política para UPDATE - permitir atualizar convites da própria organização
CREATE POLICY "update_organization_invitations" ON public.doctor_invitations
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

-- Política para DELETE - permitir deletar convites da própria organização
CREATE POLICY "delete_organization_invitations" ON public.doctor_invitations
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_doctor_invitations_org_user ON public.doctor_invitations(organization_id, invited_by);
CREATE INDEX IF NOT EXISTS idx_doctor_invitations_email_status ON public.doctor_invitations(email, status);
