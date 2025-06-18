
-- Tabela para logs da aplicação
CREATE TABLE public.application_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  event TEXT NOT NULL,
  user_id UUID,
  session_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para métricas de performance
CREATE TABLE public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para cache inteligente
CREATE TABLE public.query_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash TEXT NOT NULL,
  query_normalized TEXT NOT NULL,
  response TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_hit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  quality_score NUMERIC DEFAULT 0.5 CHECK (quality_score >= 0 AND quality_score <= 1),
  metadata JSONB DEFAULT '{}'
);

-- Tabela para tiers de usuários
CREATE TABLE public.user_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier_name TEXT NOT NULL CHECK (tier_name IN ('free', 'pro', 'premium', 'enterprise')),
  daily_limit INTEGER NOT NULL DEFAULT 10,
  monthly_limit INTEGER NOT NULL DEFAULT 200,
  priority_bonus INTEGER DEFAULT 0,
  cache_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para estatísticas de uso
CREATE TABLE public.usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  queries_today INTEGER DEFAULT 0,
  queries_this_month INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  avg_daily NUMERIC DEFAULT 0,
  last_query_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Tabela para sessões de usuários
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}'
);

-- Índices para performance
CREATE INDEX idx_application_logs_timestamp ON public.application_logs(timestamp);
CREATE INDEX idx_application_logs_user_id ON public.application_logs(user_id);
CREATE INDEX idx_application_logs_level ON public.application_logs(level);
CREATE INDEX idx_application_logs_event ON public.application_logs(event);

CREATE INDEX idx_performance_metrics_name ON public.performance_metrics(name);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);

CREATE INDEX idx_query_cache_hash ON public.query_cache(query_hash);
CREATE INDEX idx_query_cache_specialty ON public.query_cache(specialty);
CREATE INDEX idx_query_cache_expires ON public.query_cache(expires_at);
CREATE INDEX idx_query_cache_quality ON public.query_cache(quality_score);

CREATE INDEX idx_user_tiers_user_id ON public.user_tiers(user_id);
CREATE INDEX idx_usage_stats_user_date ON public.usage_stats(user_id, date);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);

-- Políticas RLS
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para logs (admins veem tudo, usuários veem só os seus)
CREATE POLICY "Users can view their own logs" ON public.application_logs
  FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Anyone can insert logs" ON public.application_logs
  FOR INSERT WITH CHECK (true);

-- Políticas para métricas (similares aos logs)
CREATE POLICY "Users can view metrics" ON public.performance_metrics
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (true);

-- Políticas para cache (acesso geral para leitura)
CREATE POLICY "Anyone can read cache" ON public.query_cache
  FOR SELECT USING (true);

CREATE POLICY "Anyone can write cache" ON public.query_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update cache" ON public.query_cache
  FOR UPDATE USING (true);

-- Políticas para tiers de usuários
CREATE POLICY "Users can view their tier" ON public.user_tiers
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their tier" ON public.user_tiers
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can insert tiers" ON public.user_tiers
  FOR INSERT WITH CHECK (true);

-- Políticas para estatísticas de uso
CREATE POLICY "Users can view their stats" ON public.usage_stats
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their stats" ON public.usage_stats
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their stats" ON public.usage_stats
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Políticas para sessões
CREATE POLICY "Users can view their sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Anyone can insert sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" ON public.user_sessions
  FOR UPDATE USING (true);

-- Função para limpeza automática de logs antigos (executar semanalmente)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
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
