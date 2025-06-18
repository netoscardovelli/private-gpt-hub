
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Database, Zap, Activity, AlertTriangle } from 'lucide-react';

interface SystemMetric {
  timestamp: string;
  name: string;
  value: number;
  unit: string;
}

interface AggregatedMetric {
  timestamp: string;
  response_time: number;
  memory_usage: number;
  cpu_usage: number;
  database_connections: number;
}

const SystemMetrics = () => {
  const [metrics, setMetrics] = useState<AggregatedMetric[]>([]);
  const [currentStats, setCurrentStats] = useState({
    avgResponseTime: 0,
    peakMemoryUsage: 0,
    avgCpuUsage: 0,
    activeConnections: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    fetchCurrentStats();
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Agrupar métricas por timestamp (hour)
      const groupedMetrics = data?.reduce((acc: any, metric) => {
        const hour = new Date(metric.timestamp).toISOString().substring(0, 13) + ':00:00.000Z';
        
        if (!acc[hour]) {
          acc[hour] = {
            timestamp: hour,
            response_time: [],
            memory_usage: [],
            cpu_usage: [],
            database_connections: []
          };
        }

        switch (metric.name) {
          case 'response_time':
            acc[hour].response_time.push(metric.value);
            break;
          case 'memory_usage':
            acc[hour].memory_usage.push(metric.value);
            break;
          case 'cpu_usage':
            acc[hour].cpu_usage.push(metric.value);
            break;
          case 'database_connections':
            acc[hour].database_connections.push(metric.value);
            break;
        }

        return acc;
      }, {});

      const chartData = Object.values(groupedMetrics || {}).map((hour: any) => ({
        timestamp: new Date(hour.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        response_time: hour.response_time.length > 0 ? 
          hour.response_time.reduce((sum: number, val: number) => sum + val, 0) / hour.response_time.length : 0,
        memory_usage: hour.memory_usage.length > 0 ? 
          hour.memory_usage.reduce((sum: number, val: number) => sum + val, 0) / hour.memory_usage.length : 0,
        cpu_usage: hour.cpu_usage.length > 0 ? 
          hour.cpu_usage.reduce((sum: number, val: number) => sum + val, 0) / hour.cpu_usage.length : 0,
        database_connections: hour.database_connections.length > 0 ? 
          hour.database_connections.reduce((sum: number, val: number) => sum + val, 0) / hour.database_connections.length : 0
      }));

      setMetrics(chartData);
    } catch (error) {
      console.error('Erro ao buscar métricas do sistema:', error);
    }
  };

  const fetchCurrentStats = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const responseTimeMetrics = data?.filter(m => m.name === 'response_time') || [];
      const memoryMetrics = data?.filter(m => m.name === 'memory_usage') || [];
      const cpuMetrics = data?.filter(m => m.name === 'cpu_usage') || [];
      const connectionMetrics = data?.filter(m => m.name === 'database_connections') || [];

      setCurrentStats({
        avgResponseTime: responseTimeMetrics.length > 0 ? 
          responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length : 0,
        peakMemoryUsage: memoryMetrics.length > 0 ? 
          Math.max(...memoryMetrics.map(m => m.value)) : 0,
        avgCpuUsage: cpuMetrics.length > 0 ? 
          cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length : 0,
        activeConnections: connectionMetrics.length > 0 ? 
          connectionMetrics[connectionMetrics.length - 1].value : 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas atuais:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta Médio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(currentStats.avgResponseTime)}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pico de Memória</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(currentStats.peakMemoryUsage)}MB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Médio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(currentStats.avgCpuUsage)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(currentStats.activeConnections)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="response_time" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso de Memória (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="memory_usage" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso de CPU (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpu_usage" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conexões de Banco (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="database_connections" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemMetrics;
