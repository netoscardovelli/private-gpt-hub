
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAPIUsage, useAPICache, useClearExpiredCache } from '@/hooks/useAPIManagement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Clock, Database, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const APIMonitoring = () => {
  const { data: usage, isLoading: usageLoading } = useAPIUsage();
  const { data: cache, isLoading: cacheLoading } = useAPICache();
  const clearCache = useClearExpiredCache();

  // Agregar dados para gráficos
  const usageByEndpoint = usage?.reduce((acc, item) => {
    const endpoint = item.endpoint;
    acc[endpoint] = (acc[endpoint] || 0) + item.requests_count;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(usageByEndpoint || {}).map(([endpoint, count]) => ({
    endpoint,
    requests: count
  }));

  const responseTimeData = usage?.filter(item => item.response_time_ms)
    .slice(0, 20)
    .map(item => ({
      endpoint: item.endpoint,
      responseTime: item.response_time_ms,
      timestamp: format(new Date(item.last_request), 'HH:mm')
    })) || [];

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'bg-gray-500';
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-500';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-500';
    if (statusCode >= 500) return 'bg-red-500';
    return 'bg-gray-500';
  };

  if (usageLoading || cacheLoading) {
    return <div className="flex justify-center p-8">Carregando monitoramento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monitoramento de APIs</h2>
        <Button onClick={() => clearCache.mutate()} variant="outline">
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Cache
        </Button>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage?.reduce((sum, item) => sum + item.requests_count, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage?.filter(item => item.response_time_ms).length > 0
                ? Math.round(
                    usage
                      .filter(item => item.response_time_ms)
                      .reduce((sum, item) => sum + (item.response_time_ms || 0), 0) /
                    usage.filter(item => item.response_time_ms).length
                  )
                : 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cache?.reduce((sum, item) => sum + item.hit_count, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endpoints Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(usageByEndpoint || {}).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Requests por Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="endpoint" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Log de Requests Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Requests Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usage?.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{item.method}</Badge>
                  <span className="font-mono text-sm">{item.endpoint}</span>
                  {item.status_code && (
                    <Badge className={getStatusColor(item.status_code)}>
                      {item.status_code}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {item.response_time_ms && (
                    <span>{item.response_time_ms}ms</span>
                  )}
                  <span>{format(new Date(item.last_request), 'dd/MM HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cache Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Cache</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cache?.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{item.method}</Badge>
                  <span className="font-mono text-sm">{item.endpoint}</span>
                  <Badge variant="secondary">{item.hit_count} hits</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Expira: {format(new Date(item.expires_at), 'dd/MM HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIMonitoring;
