
-- Primeiro, vamos remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow users to view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow owners to update organizations" ON public.organizations;

-- Criar política mais simples para criação
CREATE POLICY "Enable insert for authenticated users only" ON public.organizations
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Política para visualização - usuários podem ver organizações onde estão vinculados
CREATE POLICY "Enable read access for organization members" ON public.organizations
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organizations.id
    )
  );

-- Política para atualização - apenas owners e admins
CREATE POLICY "Enable update for owners and admins" ON public.organizations
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organizations.id
      AND profiles.role IN ('owner', 'admin')
    )
  );
