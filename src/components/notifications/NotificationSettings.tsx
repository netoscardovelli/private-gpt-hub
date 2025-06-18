
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationSettings as NotificationSettingsType } from '@/types/notifications';

const NotificationSettings = () => {
  const { settings, updateSettings, fetchSettings } = useNotifications();
  const [localSettings, setLocalSettings] = useState<Partial<NotificationSettingsType>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalSetting = (key: keyof NotificationSettingsType, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Canais de Notificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Canais de Notificação</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-gray-500">
                  Receba notificações importantes por email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={localSettings.email_notifications || false}
                onCheckedChange={(checked) => updateLocalSetting('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-gray-500">
                  Receba notificações no navegador
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={localSettings.push_notifications || false}
                onCheckedChange={(checked) => updateLocalSetting('push_notifications', checked)}
              />
            </div>
          </div>

          {/* Tipos de Alertas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tipos de Alertas</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="incompatibility-alerts">Alertas de Incompatibilidade</Label>
                <p className="text-sm text-gray-500">
                  Seja notificado sobre incompatibilidades de ativos
                </p>
              </div>
              <Switch
                id="incompatibility-alerts"
                checked={localSettings.incompatibility_alerts || false}
                onCheckedChange={(checked) => updateLocalSetting('incompatibility_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="performance-alerts">Alertas de Performance</Label>
                <p className="text-sm text-gray-500">
                  Receba alertas sobre métricas e performance
                </p>
              </div>
              <Switch
                id="performance-alerts"
                checked={localSettings.performance_alerts || false}
                onCheckedChange={(checked) => updateLocalSetting('performance_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">Atualizações do Sistema</Label>
                <p className="text-sm text-gray-500">
                  Seja informado sobre atualizações e novidades
                </p>
              </div>
              <Switch
                id="system-updates"
                checked={localSettings.system_updates || false}
                onCheckedChange={(checked) => updateLocalSetting('system_updates', checked)}
              />
            </div>
          </div>

          {/* Frequência */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Frequência</h3>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência das Notificações</Label>
              <Select
                value={localSettings.frequency || 'immediate'}
                onValueChange={(value) => updateLocalSetting('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Imediata</SelectItem>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horário Silencioso */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Horário Silencioso</h3>
            <p className="text-sm text-gray-500">
              Configure um período em que você não deseja receber notificações
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Início</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={localSettings.quiet_hours_start || ''}
                  onChange={(e) => updateLocalSetting('quiet_hours_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">Fim</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={localSettings.quiet_hours_end || ''}
                  onChange={(e) => updateLocalSetting('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
