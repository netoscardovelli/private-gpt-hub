
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { MessageCircle, Users, Clock, TrendingUp } from 'lucide-react';

interface ChatMetric {
  date: string;
  messages: number;
  sessions: number;
  avg_tokens: number;
  unique_users: number;
}

interface SpecialtyData {
  specialty: string;
  count: number;
  percentage: number;
}

const ChatMetrics = () => {
  const [metrics, setMetrics] = useState<ChatMetric[]>([]);
  const [specialtyData, setSpecialtyData] = useState<SpecialtyData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalMessages: 0,
    totalSessions: 0,
    avgResponseTime: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatMetrics();
    fetchSpecialtyDistribution();
    fetchTotalStats();
  }, []);

  const fetchChatMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          created_at,
          session_id,
          user_id,
          tokens_used,
          response_time_ms
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Agrupar dados por dia
      const groupedData = data?.reduce((acc: any, message) => {
        const date = new Date(message.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            messages: 0,
            sessions: new Set(),
            users: new Set(),
            totalTokens: 0,
            responseTimeSum: 0,
            responseTimeCount: 0
          };
        }
        
        acc[date].messages++;
        acc[date].sessions.add(message.session_id);
        acc[date].users.add(message.user_id);
        acc[date].totalTokens += message.tokens_used || 0;
        
        if (message.response_time_ms) {
          acc[date].responseTimeSum += message.response_time_ms;
          acc[date].responseTimeCount++;
        }
        
        return acc;
      }, {});

      const chartData = Object.values(groupedData || {}).map((day: any) => ({
        date: day.date,
        messages: day.messages,
        sessions: day.sessions.size,
        avg_tokens: day.totalTokens / day.messages,
        unique_users: day.users.size
      }));

      setMetrics(chartData);
    } catch (error) {
      console.error('Erro ao buscar métricas de chat:', error);
    }
  };

  const fetchSpecialtyDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('specialty')
        .not('specialty', 'is', null);

      if (error) throw error;

      const specialtyCount = data?.reduce((acc: any, message) => {
        const specialty = message.specialty || 'Não especificado';
        acc[specialty] = (acc[specialty] || 0) + 1;
        return acc;
      }, {});

      const total = Object.values(specialtyCount || {}).reduce((sum: number, count: any) => sum + count, 0);

      const specialtyChartData = Object.entries(specialtyCount || {}).map(([specialty, count]) => ({
        specialty,
        count: count as number,
        percentage: ((count as number) / total) * 100
      }));

      setSpecialtyData(specialtyChartData);
    } catch (error) {
      console.error('Erro ao buscar distribuição por especialidade:', error);
    }
  };

  const fetchTotalStats = async () => {
    try {
      const [messagesResult, sessionsResult, avgResponseResult, usersResult] = await Promise.all([
        supabase.from('chat_messages').select('id', { count: 'exact' }),
        supabase.from('chat_sessions').select('id', { count: 'exact' }),
        supabase.from('chat_messages').select('response_time_ms').not('response_time_ms', 'is', null),
        supabase.from('chat_sessions').select('user_id').gte('session_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const avgResponseTime = avgResponseResult.data?.reduce((sum, msg) => sum + (msg.response_time_ms || 0), 0) / (avgResponseResult.data?.length || 1);
      const uniqueUsers = new Set(usersResult.data?.map(session => session.user_id)).size;

      setTotalStats({
        totalMessages: messagesResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        avgResponseTime: avgResponseTime || 0,
        activeUsers: uniqueUsers
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas totais:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalMessages.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões de Chat</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalSessions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStats.avgResponseTime)}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos (7d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mensagens por Dia (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessões vs Usuários Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#8884d8" />
                <Bar dataKey="unique_users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Especialidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ specialty, percentage }) => `${specialty} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tokens Médios por Mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avg_tokens" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatMetrics;
