
-- Remover as políticas restritivas atuais e criar políticas mais permissivas
DROP POLICY IF EXISTS "Authenticated users can manage reference formulas" ON public.reference_formulas;
DROP POLICY IF EXISTS "Authenticated users can manage formula actives" ON public.reference_formula_actives;

-- Criar políticas que permitam inserção pública para fórmulas de referência
CREATE POLICY "Anyone can manage reference formulas" 
  ON public.reference_formulas 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage formula actives" 
  ON public.reference_formula_actives 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);
