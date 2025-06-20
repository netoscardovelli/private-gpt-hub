
-- Adicionar política que permite acesso público aos convites pelo token
-- Isso é necessário para que usuários não autenticados possam validar convites
CREATE POLICY "Anyone can view invitation by token for validation" ON public.doctor_invitations
  FOR SELECT 
  TO anon, authenticated
  USING (invitation_token IS NOT NULL);
