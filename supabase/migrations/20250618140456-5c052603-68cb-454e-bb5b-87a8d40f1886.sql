
-- Criar tabela para configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#10b981',
  secondary_color TEXT NOT NULL DEFAULT '#6366f1',
  company_name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas suas próprias configurações
CREATE POLICY "Users can view their own settings" 
  ON public.system_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.system_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.system_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
  ON public.system_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar bucket de storage para logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true);

-- Políticas de storage para logos
CREATE POLICY "Users can upload logos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view logos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'logos');

CREATE POLICY "Users can update their own logos" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
