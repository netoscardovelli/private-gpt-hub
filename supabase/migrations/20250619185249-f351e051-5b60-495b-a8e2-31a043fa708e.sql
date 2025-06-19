
-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can manage their organization" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update their organization" ON public.organizations;

-- Criar nova política para permitir usuários autenticados criarem organizações
CREATE POLICY "Allow authenticated users to create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que usuários vejam organizações das quais fazem parte
CREATE POLICY "Allow users to view their organizations" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Permitir que owners/admins atualizem suas organizações
CREATE POLICY "Allow owners to update organizations" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );
