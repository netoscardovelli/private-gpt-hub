
-- Tabela principal de notificações
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  priority TEXT NOT NULL DEFAULT 'medium',
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de configurações de notificações por usuário
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  incompatibility_alerts BOOLEAN NOT NULL DEFAULT true,
  performance_alerts BOOLEAN NOT NULL DEFAULT true,
  system_updates BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'immediate',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de alertas automáticos
CREATE TABLE public.automated_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  condition_rules JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de log de notificações enviadas
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id),
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notifications
CREATE POLICY "Users can view their organization notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create notifications for their organization" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Políticas RLS para notification_settings
CREATE POLICY "Users can manage their notification settings" 
  ON public.notification_settings 
  FOR ALL 
  USING (user_id = auth.uid());

-- Políticas RLS para automated_alerts
CREATE POLICY "Users can manage their organization alerts" 
  ON public.automated_alerts 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Políticas RLS para notification_logs
CREATE POLICY "Users can view their organization notification logs" 
  ON public.notification_logs 
  FOR SELECT 
  USING (
    notification_id IN (
      SELECT id FROM public.notifications 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Índices para performance
CREATE INDEX idx_notifications_organization_user ON public.notifications(organization_id, user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notification_settings_user ON public.notification_settings(user_id);
CREATE INDEX idx_automated_alerts_organization ON public.automated_alerts(organization_id);
CREATE INDEX idx_notification_logs_notification ON public.notification_logs(notification_id);

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  DELETE FROM public.notification_logs 
  WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$$;
