
-- Remover todas as políticas existentes que estão causando conflito
DROP POLICY IF EXISTS "Allow organization creation" ON public.organizations;
DROP POLICY IF EXISTS "Allow organization read" ON public.organizations;
DROP POLICY IF EXISTS "Allow organization update" ON public.organizations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.organizations;
DROP POLICY IF EXISTS "Enable read access for organization members" ON public.organizations;
DROP POLICY IF EXISTS "Enable update for owners and admins" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow users to view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow owners to update organizations" ON public.organizations;

-- Criar políticas simples e funcionais
-- Política para INSERT - permite usuários autenticados criarem organizações
CREATE POLICY "authenticated_users_can_insert_organizations" ON public.organizations
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Política para SELECT - permite usuários autenticados verem todas as organizações
CREATE POLICY "authenticated_users_can_select_organizations" ON public.organizations
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para UPDATE - permite usuários autenticados atualizarem organizações
CREATE POLICY "authenticated_users_can_update_organizations" ON public.organizations
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
