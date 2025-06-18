
import { supabase } from '@/integrations/supabase/client';
import type { Notification, NotificationSettings, AutomatedAlert } from '@/types/notifications';

// Buscar notificações do usuário
export const fetchNotificationsApi = async (
  organizationId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.is('read_at', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Notification[];
};

// Marcar notificação como lida
export const markNotificationAsReadApi = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
};

// Marcar todas as notificações como lidas
export const markAllNotificationsAsReadApi = async (organizationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('organization_id', organizationId)
    .is('read_at', null);

  if (error) throw error;
};

// Criar nova notificação
export const createNotificationApi = async (
  notification: Omit<Notification, 'id' | 'created_at'>
): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
};

// Buscar configurações de notificação do usuário
export const fetchNotificationSettingsApi = async (userId: string): Promise<NotificationSettings | null> => {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as NotificationSettings | null;
};

// Atualizar configurações de notificação
export const updateNotificationSettingsApi = async (
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  const { data: existing } = await supabase
    .from('notification_settings')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('notification_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as NotificationSettings;
  } else {
    const { data, error } = await supabase
      .from('notification_settings')
      .insert({ user_id: userId, ...settings })
      .select()
      .single();

    if (error) throw error;
    return data as NotificationSettings;
  }
};

// Buscar alertas automáticos
export const fetchAutomatedAlertsApi = async (organizationId: string): Promise<AutomatedAlert[]> => {
  const { data, error } = await supabase
    .from('automated_alerts')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as AutomatedAlert[];
};

// Criar alerta automático
export const createAutomatedAlertApi = async (
  alert: Omit<AutomatedAlert, 'id' | 'created_at' | 'updated_at' | 'trigger_count'>
): Promise<AutomatedAlert> => {
  const { data, error } = await supabase
    .from('automated_alerts')
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data as AutomatedAlert;
};

// Atualizar alerta automático
export const updateAutomatedAlertApi = async (
  alertId: string,
  updates: Partial<AutomatedAlert>
): Promise<AutomatedAlert> => {
  const { data, error } = await supabase
    .from('automated_alerts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data as AutomatedAlert;
};

// Deletar alerta automático
export const deleteAutomatedAlertApi = async (alertId: string): Promise<void> => {
  const { error } = await supabase
    .from('automated_alerts')
    .delete()
    .eq('id', alertId);

  if (error) throw error;
};
