
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import APIPartnerManagement from '@/components/api/APIPartnerManagement';
import APIMonitoring from '@/components/api/APIMonitoring';
import { Settings, Activity, Users, Database } from 'lucide-react';

const APIManagementPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gerenciamento de APIs</h1>
          <p className="text-slate-400">
            Gerencie parceiros, monitore uso e configure integrações externas
          </p>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Parceiros
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <APIPartnerManagement />
          </TabsContent>

          <TabsContent value="monitoring">
            <APIMonitoring />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-8 text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-4" />
              <p>Configurações de integração em desenvolvimento</p>
              <p className="text-sm mt-2">
                Em breve você poderá configurar integrações com farmácias e laboratórios
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default APIManagementPage;
