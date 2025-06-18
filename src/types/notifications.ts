
export interface Notification {
  id: string;
  organization_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  organization_id?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  incompatibility_alerts: boolean;
  performance_alerts: boolean;
  system_updates: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomatedAlert {
  id: string;
  organization_id: string;
  alert_type: string;
  condition_rules: Record<string, any>;
  is_active: boolean;
  last_triggered?: string;
  trigger_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  notification_id?: string;
  channel: 'email' | 'push' | 'in_app';
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  error_message?: string;
  metadata?: Record<string, any>;
}
