
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  fetchNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  createNotificationApi,
  fetchNotificationSettingsApi,
  updateNotificationSettingsApi,
  fetchAutomatedAlertsApi,
  createAutomatedAlertApi,
  updateAutomatedAlertApi,
  deleteAutomatedAlertApi
} from '@/services/notificationsApi';
import type { Notification, NotificationSettings, AutomatedAlert } from '@/types/notifications';

export const useNotifications = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [automatedAlerts, setAutomatedAlerts] = useState<AutomatedAlert[]>([]);

  // Buscar notificações
  const fetchNotifications = async (unreadOnly: boolean = false) => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      const data = await fetchNotificationsApi(profile.organization_id, unreadOnly);
      setNotifications(data);
      
      const unread = data.filter(n => !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar como lida
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsReadApi(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!profile?.organization_id) return;

    try {
      await markAllNotificationsAsReadApi(profile.organization_id);
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast({
        title: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: "Erro ao atualizar notificações",
        variant: "destructive"
      });
    }
  };

  // Criar nova notificação
  const createNotification = async (
    notification: Omit<Notification, 'id' | 'created_at' | 'organization_id'>
  ) => {
    if (!profile?.organization_id) return;

    try {
      const newNotification = await createNotificationApi({
        ...notification,
        organization_id: profile.organization_id
      });
      
      setNotifications(prev => [newNotification, ...prev]);
      if (!newNotification.read_at) {
        setUnreadCount(prev => prev + 1);
      }
      
      return newNotification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  };

  // Buscar configurações
  const fetchSettings = async () => {
    if (!profile?.id) return;

    try {
      const data = await fetchNotificationSettingsApi(profile.id);
      setSettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  // Atualizar configurações
  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!profile?.id) return;

    try {
      const updatedSettings = await updateNotificationSettingsApi(profile.id, updates);
      setSettings(updatedSettings);
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências de notificação foram salvas."
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: "Erro ao salvar configurações",
        variant: "destructive"
      });
    }
  };

  // Buscar alertas automáticos
  const fetchAutomatedAlerts = async () => {
    if (!profile?.organization_id) return;

    try {
      const data = await fetchAutomatedAlertsApi(profile.organization_id);
      setAutomatedAlerts(data);
    } catch (error) {
      console.error('Erro ao buscar alertas automáticos:', error);
    }
  };

  // Criar alerta automático
  const createAutomatedAlert = async (
    alert: Omit<AutomatedAlert, 'id' | 'created_at' | 'updated_at' | 'trigger_count' | 'organization_id'>
  ) => {
    if (!profile?.organization_id) return;

    try {
      const newAlert = await createAutomatedAlertApi({
        ...alert,
        organization_id: profile.organization_id
      });
      setAutomatedAlerts(prev => [newAlert, ...prev]);
      toast({
        title: "Alerta automático criado",
        description: "O alerta foi configurado com sucesso."
      });
      return newAlert;
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      toast({
        title: "Erro ao criar alerta",
        variant: "destructive"
      });
    }
  };

  // Atualizar alerta automático
  const updateAutomatedAlert = async (alertId: string, updates: Partial<AutomatedAlert>) => {
    try {
      const updatedAlert = await updateAutomatedAlertApi(alertId, updates);
      setAutomatedAlerts(prev => 
        prev.map(alert => alert.id === alertId ? updatedAlert : alert)
      );
      toast({
        title: "Alerta atualizado",
        description: "As configurações do alerta foram salvas."
      });
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error);
      toast({
        title: "Erro ao atualizar alerta",
        variant: "destructive"
      });
    }
  };

  // Deletar alerta automático
  const deleteAutomatedAlert = async (alertId: string) => {
    try {
      await deleteAutomatedAlertApi(alertId);
      setAutomatedAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast({
        title: "Alerta removido",
        description: "O alerta automático foi excluído."
      });
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      toast({
        title: "Erro ao remover alerta",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (profile?.organization_id) {
      fetchNotifications();
      fetchSettings();
      fetchAutomatedAlerts();
    }
  }, [profile?.organization_id]);

  return {
    isLoading,
    notifications,
    unreadCount,
    settings,
    automatedAlerts,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    fetchSettings,
    updateSettings,
    fetchAutomatedAlerts,
    createAutomatedAlert,
    updateAutomatedAlert,
    deleteAutomatedAlert
  };
};
