
-- Verificar e adicionar as colunas que estão faltando na tabela organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;
