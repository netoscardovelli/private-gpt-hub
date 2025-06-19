
-- Temporariamente desabilitar RLS para permitir onboarding
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Recriar as políticas de forma mais permissiva
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.organizations;
DROP POLICY IF EXISTS "Enable read access for organization members" ON public.organizations;
DROP POLICY IF EXISTS "Enable update for owners and admins" ON public.organizations;

-- Política simples de INSERT - qualquer usuário autenticado pode criar
CREATE POLICY "Allow organization creation" ON public.organizations
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Política de SELECT - todos podem ver todas as organizações por enquanto
CREATE POLICY "Allow organization read" ON public.organizations
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política de UPDATE - todos podem atualizar por enquanto
CREATE POLICY "Allow organization update" ON public.organizations
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Reabilitar RLS com as novas políticas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
