
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMetrics from './ChatMetrics';
import SystemMetrics from './SystemMetrics';
import { MessageCircle, Activity, BarChart3, Database } from 'lucide-react';

const AnalyticsDashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Acompanhe métricas de uso e performance do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat & Usuários
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <ChatMetrics />
        </TabsContent>

        <TabsContent value="system">
          <SystemMetrics />
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Relatórios Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Relatório de Fórmulas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Análise detalhada das fórmulas mais utilizadas e suas categorias.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Antioxidantes</span>
                        <span className="font-bold">23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nootrópicos</span>
                        <span className="font-bold">19%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anti-inflamatórios</span>
                        <span className="font-bold">16%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emagrecimento</span>
                        <span className="font-bold">15%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Padrões de Uso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Análise de padrões temporais e comportamentais dos usuários.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Pico de uso</span>
                        <span className="font-bold">14:00-16:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessão média</span>
                        <span className="font-bold">12 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retorno em 7 dias</span>
                        <span className="font-bold">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfação média</span>
                        <span className="font-bold">4.2/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas de API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Status e uso das APIs pelos parceiros integrados.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Requests hoje</span>
                        <span className="font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parceiros ativos</span>
                        <span className="font-bold">3/3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime</span>
                        <span className="font-bold">99.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latência média</span>
                        <span className="font-bold">142ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Alertas e Monitoramento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Status do sistema e alertas de performance.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Status do sistema</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                          Operacional
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cache inteligente</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                          95% hit rate
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Backup</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
                          Automático
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
