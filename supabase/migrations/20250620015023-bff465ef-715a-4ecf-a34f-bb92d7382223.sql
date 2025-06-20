
-- Remover todas as políticas existentes da tabela doctor_invitations
DROP POLICY IF EXISTS "Allow organization members to view invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Allow admins to manage invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Organization members can view invitations" ON public.doctor_invitations;
DROP POLICY IF EXISTS "Organization admins can manage invitations" ON public.doctor_invitations;

-- Criar função de segurança para verificar permissões de convite de médicos
CREATE OR REPLACE FUNCTION public.can_manage_doctor_invitations()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id IS NOT NULL
    AND role IN ('admin', 'super_admin', 'owner')
  );
$$;

-- Política para SELECT - permite usuários com permissão verem convites da sua organização
CREATE POLICY "users_can_view_organization_doctor_invitations" ON public.doctor_invitations
  FOR SELECT 
  TO authenticated
  USING (
    public.can_manage_doctor_invitations() AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para INSERT - permite usuários com permissão criarem convites
CREATE POLICY "users_can_create_doctor_invitations" ON public.doctor_invitations
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    public.can_manage_doctor_invitations() AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
    invited_by = auth.uid()
  );

-- Política para UPDATE - permite usuários com permissão atualizarem convites da sua organização
CREATE POLICY "users_can_update_organization_doctor_invitations" ON public.doctor_invitations
  FOR UPDATE 
  TO authenticated
  USING (
    public.can_manage_doctor_invitations() AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    public.can_manage_doctor_invitations() AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Garantir que RLS está habilitado
ALTER TABLE public.doctor_invitations ENABLE ROW LEVEL SECURITY;
