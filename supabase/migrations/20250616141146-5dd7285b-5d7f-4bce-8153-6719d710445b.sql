
-- Tabela para perfis dos médicos com sistema de aprendizado
CREATE TABLE public.doctor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  specialty TEXT DEFAULT 'Medicina Geral',
  experience_level TEXT DEFAULT 'Iniciante',
  focus_area TEXT DEFAULT 'Clínica Geral',
  formulation_preferences TEXT,
  preferred_protocols TEXT,
  preferred_actives JSONB DEFAULT '[]'::jsonb,
  concentration_preferences JSONB DEFAULT '[]'::jsonb,
  formulation_style TEXT,
  focus_areas JSONB DEFAULT '[]'::jsonb,
  recent_patterns JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para armazenar feedback das análises
CREATE TABLE public.analysis_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  original_analysis TEXT NOT NULL,
  feedback TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para doctor_profiles
CREATE POLICY "Users can view their own doctor profile" 
  ON public.doctor_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own doctor profile" 
  ON public.doctor_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doctor profile" 
  ON public.doctor_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para analysis_feedback
CREATE POLICY "Users can view their own feedback" 
  ON public.analysis_feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" 
  ON public.analysis_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
CREATE INDEX idx_analysis_feedback_user_id ON public.analysis_feedback(user_id);
CREATE INDEX idx_analysis_feedback_created_at ON public.analysis_feedback(created_at);
