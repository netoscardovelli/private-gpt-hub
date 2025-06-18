
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';

interface AnalyticsData {
  dailyUsage: Array<{ date: string; queries: number; users: number }>;
  topSpecialties: Array<{ name: string; count: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  performanceMetrics: {
    avgResponseTime: number;
    totalQueries: number;
    activeUsers: number;
    cacheHitRate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = () => {
  const { profile } = useAuth();
  const { hasPermission } = useRoles();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    dailyUsage: [],
    topSpecialties: [],
    userGrowth: [],
    performanceMetrics: {
      avgResponseTime: 0,
      totalQueries: 0,
      activeUsers: 0,
      cacheHitRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (hasPermission('canAccessAnalytics')) {
      loadAnalytics();
    }
  }, [timeRange, hasPermission]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Calcular data de início baseada no range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Buscar dados de uso diário
      const { data: usageData } = await supabase
        .from('usage_stats')
        .select('date, queries_today, user_id')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      // Processar dados de uso diário
      const dailyUsageMap = new Map();
      usageData?.forEach(stat => {
        const dateKey = stat.date;
        if (!dailyUsageMap.has(dateKey)) {
          dailyUsageMap.set(dateKey, { date: dateKey, queries: 0, users: new Set() });
        }
        const entry = dailyUsageMap.get(dateKey);
        entry.queries += stat.queries_today;
        entry.users.add(stat.user_id);
      });

      const dailyUsage = Array.from(dailyUsageMap.values()).map(entry => ({
        date: entry.date,
        queries: entry.queries,
        users: entry.users.size
      })).sort((a, b) => a.date.localeCompare(b.date));

      // Buscar métricas de performance
      const { data: performanceData } = await supabase
        .from('performance_metrics')
        .select('name, value')
        .gte('timestamp', startDate.toISOString());

      // Processar métricas de performance
      const performanceMap = new Map();
      performanceData?.forEach(metric => {
        if (!performanceMap.has(metric.name)) {
          performanceMap.set(metric.name, []);
        }
        performanceMap.get(metric.name).push(metric.value);
      });

      const calculateAverage = (values: number[]) => 
        values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;

      const performanceMetrics = {
        avgResponseTime: calculateAverage(performanceMap.get('response_time') || []),
        totalQueries: (performanceMap.get('total_queries') || []).length,
        activeUsers: (performanceMap.get('active_users') || []).length,
        cacheHitRate: calculateAverage(performanceMap.get('cache_hit_rate') || [])
      };

      // Dados simulados para especialidades (será implementado quando tivermos logs detalhados)
      const topSpecialties = [
        { name: 'Dermatologia', count: 450 },
        { name: 'Cardiologia', count: 320 },
        { name: 'Neurologia', count: 280 },
        { name: 'Ortopedia', count: 240 },
        { name: 'Pediatria', count: 180 }
      ];

      // Dados simulados para crescimento de usuários
      const userGrowth = [
        { month: 'Jan', users: 100 },
        { month: 'Fev', users: 150 },
        { month: 'Mar', users: 220 },
        { month: 'Abr', users: 280 },
        { month: 'Mai', users: 350 },
        { month: 'Jun', users: 420 }
      ];

      setAnalytics({
        dailyUsage,
        topSpecialties,
        userGrowth,
        performanceMetrics
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('canAccessAnalytics')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você não tem permissão para acessar analytics.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performanceMetrics.avgResponseTime.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performanceMetrics.totalQueries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performanceMetrics.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cache Hit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos detalhados */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Uso Diário</TabsTrigger>
          <TabsTrigger value="specialties">Especialidades</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Uso Diário da Plataforma</CardTitle>
              <CardDescription>Consultas e usuários ativos por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="queries" stroke="#8884d8" name="Consultas" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Usuários" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties">
          <Card>
            <CardHeader>
              <CardTitle>Top Especialidades</CardTitle>
              <CardDescription>Especialidades mais consultadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.topSpecialties}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.topSpecialties.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topSpecialties} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Usuários</CardTitle>
              <CardDescription>Evolução da base de usuários ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
