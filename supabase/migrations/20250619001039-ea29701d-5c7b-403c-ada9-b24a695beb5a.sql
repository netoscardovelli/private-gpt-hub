
-- Tabela para prescrições digitais
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_number TEXT NOT NULL UNIQUE,
  doctor_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  patient_cpf TEXT NOT NULL,
  patient_birth_date DATE NOT NULL,
  patient_address JSONB NOT NULL,
  pharmacy_id UUID,
  organization_id UUID NOT NULL,
  prescription_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  clinical_indication TEXT,
  special_instructions TEXT,
  digital_signature JSONB,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  controlled_medication BOOLEAN DEFAULT false,
  sngpc_reported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para itens da prescrição (medicamentos/fórmulas)
CREATE TABLE public.prescription_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  active_ingredients JSONB NOT NULL,
  concentration TEXT NOT NULL,
  pharmaceutical_form TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  dosage_instructions TEXT NOT NULL,
  duration_days INTEGER,
  controlled_substance BOOLEAN DEFAULT false,
  anvisa_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para templates de prescrição
CREATE TABLE public.prescription_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  doctor_id UUID,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  specialty TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para logs de dispensação
CREATE TABLE public.dispensation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id),
  prescription_item_id UUID NOT NULL REFERENCES public.prescription_items(id),
  pharmacist_id UUID NOT NULL,
  pharmacy_id UUID NOT NULL,
  dispensed_quantity INTEGER NOT NULL,
  dispensation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  patient_signature JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para assinaturas digitais
CREATE TABLE public.digital_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id),
  signer_id UUID NOT NULL,
  certificate_info JSONB NOT NULL,
  signature_data TEXT NOT NULL,
  timestamp_data JSONB,
  signature_type TEXT NOT NULL DEFAULT 'doctor',
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispensation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para prescrições
CREATE POLICY "Users can view prescriptions from their organization" 
  ON public.prescriptions 
  FOR SELECT 
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can create prescriptions" 
  ON public.prescriptions 
  FOR INSERT 
  WITH CHECK (
    doctor_id = auth.uid() AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can update their own prescriptions" 
  ON public.prescriptions 
  FOR UPDATE 
  USING (
    doctor_id = auth.uid() AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas RLS para itens de prescrição
CREATE POLICY "Users can view prescription items from their organization" 
  ON public.prescription_items 
  FOR SELECT 
  USING (
    prescription_id IN (
      SELECT id FROM public.prescriptions 
      WHERE organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage prescription items" 
  ON public.prescription_items 
  FOR ALL 
  USING (
    prescription_id IN (
      SELECT id FROM public.prescriptions 
      WHERE organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Políticas RLS para templates
CREATE POLICY "Users can view templates from their organization" 
  ON public.prescription_templates 
  FOR SELECT 
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage their own templates" 
  ON public.prescription_templates 
  FOR ALL 
  USING (
    created_by = auth.uid() AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas RLS para logs de dispensação
CREATE POLICY "Users can view dispensation logs from their organization" 
  ON public.dispensation_logs 
  FOR SELECT 
  USING (
    pharmacy_id IN (
      SELECT id FROM public.organizations 
      WHERE id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Pharmacists can create dispensation logs" 
  ON public.dispensation_logs 
  FOR INSERT 
  WITH CHECK (
    pharmacist_id = auth.uid()
  );

-- Políticas RLS para assinaturas digitais
CREATE POLICY "Users can view signatures from their organization" 
  ON public.digital_signatures 
  FOR SELECT 
  USING (
    prescription_id IN (
      SELECT id FROM public.prescriptions 
      WHERE organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create signatures" 
  ON public.digital_signatures 
  FOR INSERT 
  WITH CHECK (
    signer_id = auth.uid()
  );

-- Função para gerar número sequencial de prescrição
CREATE OR REPLACE FUNCTION generate_prescription_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
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

-- Função para validar CPF (simplificada)
CREATE OR REPLACE FUNCTION validate_cpf(cpf TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
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

-- Trigger para gerar número de prescrição automaticamente
CREATE OR REPLACE FUNCTION set_prescription_number()
RETURNS TRIGGER
LANGUAGE plpgsql
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

CREATE TRIGGER trigger_set_prescription_number
  BEFORE INSERT ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_prescription_number();

-- Índices para performance
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_organization_id ON public.prescriptions(organization_id);
CREATE INDEX idx_prescriptions_date ON public.prescriptions(prescription_date);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_prescription_items_prescription_id ON public.prescription_items(prescription_id);
CREATE INDEX idx_dispensation_logs_prescription_id ON public.dispensation_logs(prescription_id);
