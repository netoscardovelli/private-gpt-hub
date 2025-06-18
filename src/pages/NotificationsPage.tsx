
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Settings, AlertTriangle } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Central de Notificações</h1>
          <p className="text-slate-400">
            Gerencie suas notificações e configure alertas inteligentes
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertas Automáticos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Automáticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                  <p>Funcionalidade de alertas automáticos em desenvolvimento</p>
                  <p className="text-sm mt-2">
                    Em breve você poderá configurar alertas baseados em condições específicas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-4" />
                  <p>Histórico de notificações em desenvolvimento</p>
                  <p className="text-sm mt-2">
                    Em breve você poderá visualizar o histórico completo de suas notificações
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;
