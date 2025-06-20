
-- Corrigir warnings de segurança adicionando SET search_path = public em todas as funções

-- 1. Atualizar função cleanup_old_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove logs mais antigos que 30 dias
  DELETE FROM public.application_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Remove métricas mais antigas que 90 dias
  DELETE FROM public.performance_metrics 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove cache expirado
  DELETE FROM public.query_cache 
  WHERE expires_at < NOW();
  
  -- Remove sessões inativas há mais de 7 dias
  DELETE FROM public.user_sessions 
  WHERE last_activity < NOW() - INTERVAL '7 days';
END;
$$;

-- 2. Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 3. Atualizar função can_manage_doctor_invitations
CREATE OR REPLACE FUNCTION public.can_manage_doctor_invitations()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id IS NOT NULL
    AND role IN ('admin', 'super_admin', 'owner')
  );
$$;

-- 4. Atualizar função cleanup_expired_notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  DELETE FROM public.notification_logs 
  WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$$;

-- 5. Atualizar função generate_prescription_number
CREATE OR REPLACE FUNCTION public.generate_prescription_number(org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  org_prefix TEXT;
BEGIN
  -- Buscar prefixo da organização ou usar padrão
  SELECT COALESCE(slug, 'RX') INTO org_prefix 
  FROM public.organizations 
  WHERE id = org_id;
  
  -- Contar prescrições existentes da organização
  SELECT COUNT(*) + 1 INTO next_number
  FROM public.prescriptions
  WHERE organization_id = org_id;
  
  -- Retornar número formatado
  RETURN org_prefix || '-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$;

-- 6. Atualizar função validate_cpf
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remover caracteres não numéricos
  cpf := REGEXP_REPLACE(cpf, '[^0-9]', '', 'g');
  
  -- Verificar se tem 11 dígitos
  IF LENGTH(cpf) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se não são todos dígitos iguais
  IF cpf IN ('00000000000', '11111111111', '22222222222', '33333333333', 
             '44444444444', '55555555555', '66666666666', '77777777777',
             '88888888888', '99999999999') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 7. Atualizar função set_prescription_number
CREATE OR REPLACE FUNCTION public.set_prescription_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.prescription_number IS NULL OR NEW.prescription_number = '' THEN
    NEW.prescription_number := generate_prescription_number(NEW.organization_id);
  END IF;
  
  -- Gerar QR Code (placeholder - seria integrado com serviço externo)
  NEW.qr_code := 'QR-' || NEW.id;
  
  RETURN NEW;
END;
$$;
