import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Clock, 
  Database,
  Brain,
  HardDrive,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { monitoringService, type SystemHealth } from '@/services/MonitoringService';
import { alertingService, type Alert as AlertType } from '@/services/AlertingService';

const SystemHealthDashboard = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, alertsData, metricsData] = await Promise.all([
          monitoringService.getSystemHealth(),
          alertingService.getAllAlerts(),
          monitoringService.getMetricsSummary()
        ]);

        setHealth(healthData);
        setAlerts(alertsData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
      case 'down':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const resolveAlert = (alertId: string) => {
    alertingService.resolveAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Carregando dados de monitoramento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getStatusIcon(health?.status || 'unknown')}
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={getStatusColor(health?.status || 'unknown')}>
              {health?.status === 'healthy' ? 'Saudável' : 
               health?.status === 'degraded' ? 'Degradado' : 
               health?.status === 'critical' ? 'Crítico' : 'Desconhecido'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {health ? formatUptime(health.uptime) : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tempo de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {health ? `${health.performance.avgResponseTime.toFixed(0)}ms` : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {health?.alerts.active || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Taxa de Erro:</span>
                  <span className={`font-bold ${
                    (health?.performance.errorRate || 0) > 5 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {health?.performance.errorRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="font-bold">
                    {health?.performance.throughput.toFixed(1)} req/min
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Memória */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Memória</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Usado:</span>
                  <span className="font-bold">
                    {health ? formatBytes(health.memory.used) : '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">
                    {health ? formatBytes(health.memory.total) : '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Porcentagem:</span>
                  <span className={`font-bold ${
                    (health?.memory.percentage || 0) > 80 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {health?.memory.percentage.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health?.services.database || 'unknown')}
                  <Badge variant="outline" className={getStatusColor(health?.services.database || 'unknown')}>
                    {health?.services.database === 'up' ? 'Funcionando' :
                     health?.services.database === 'degraded' ? 'Degradado' :
                     health?.services.database === 'down' ? 'Fora do Ar' : 'Desconhecido'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Inteligência Artificial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health?.services.ai || 'unknown')}
                  <Badge variant="outline" className={getStatusColor(health?.services.ai || 'unknown')}>
                    {health?.services.ai === 'up' ? 'Funcionando' :
                     health?.services.ai === 'degraded' ? 'Degradado' :
                     health?.services.ai === 'down' ? 'Fora do Ar' : 'Desconhecido'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Armazenamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health?.services.storage || 'unknown')}
                  <Badge variant="outline" className={getStatusColor(health?.services.storage || 'unknown')}>
                    {health?.services.storage === 'up' ? 'Funcionando' :
                     health?.services.storage === 'degraded' ? 'Degradado' :
                     health?.services.storage === 'down' ? 'Fora do Ar' : 'Desconhecido'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {alerts.filter(alert => !alert.resolved).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Alerta Ativo</h3>
                  <p className="text-gray-600">Todos os sistemas estão funcionando normalmente.</p>
                </CardContent>
              </Card>
            ) : (
              alerts.filter(alert => !alert.resolved).map(alert => (
                <Alert key={alert.id} className={
                  alert.level === 'critical' ? 'border-red-500' :
                  alert.level === 'error' ? 'border-orange-500' :
                  alert.level === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        alert.level === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.level === 'error' ? 'bg-orange-100 text-orange-800' :
                        alert.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }>
                        {alert.level.toUpperCase()}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolver
                      </Button>
                    </div>
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <p>{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')} - Fonte: {alert.source}
                    </p>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.performance && Object.entries(metrics.performance).map(([operation, stats]: [string, any]) => (
                    <div key={operation} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium mb-2 capitalize">{operation.replace(/[-_]/g, ' ')}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total de Chamadas:</span>
                          <p className="font-bold">{stats.totalCalls}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Taxa de Sucesso:</span>
                          <p className={`font-bold ${stats.successRate > 95 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.successRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo Médio:</span>
                          <p className="font-bold">{stats.avgDuration.toFixed(0)}ms</p>
                        </div>
                        <div>
                          <span className="text-gray-600">P95:</span>
                          <p className="font-bold">{stats.p95Duration.toFixed(0)}ms</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;
