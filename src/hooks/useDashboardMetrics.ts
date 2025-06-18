
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useDashboardMetrics = () => {
  const { profile } = useAuth();

  // Métricas básicas de hoje
  const { data: todayMetrics, isLoading: todayLoading } = useQuery({
    queryKey: ['today-metrics', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data || { queries_today: 0, queries_this_month: 0 };
    },
    enabled: !!profile?.organization_id
  });

  // Dados de uso dos últimos 7 dias
  const { data: weeklyUsage, isLoading: weeklyLoading } = useQuery({
    queryKey: ['weekly-usage', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('usage_stats')
        .select('date, queries_today')
        .eq('organization_id', profile.organization_id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      
      // Preencher dados em falta e formatar para o gráfico
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        const dayData = data?.find(d => d.date === dateStr);
        chartData.push({
          day: dayName,
          queries: dayData?.queries_today || 0,
          sessions: Math.floor((dayData?.queries_today || 0) / 3) // Estimativa de sessões
        });
      }
      
      return chartData;
    },
    enabled: !!profile?.organization_id
  });

  // Sessões recentes
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['recent-sessions-detailed', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fórmulas mais consultadas (simulado por enquanto)
  const { data: topFormulas } = useQuery({
    queryKey: ['top-formulas', profile?.organization_id],
    queryFn: async () => {
      // Por enquanto retornamos dados simulados
      // Em uma implementação real, você consultaria uma tabela de estatísticas de fórmulas
      return [
        { name: 'Complexo B + Magnésio', category: 'Vitaminas', usage_count: 15, trend: 12 },
        { name: 'Colágeno Hidrolisado', category: 'Nutracêuticos', usage_count: 12, trend: 8 },
        { name: 'Ômega 3 + Vitamina D', category: 'Suplementos', usage_count: 9, trend: -2 },
        { name: 'Probióticos Premium', category: 'Digestivo', usage_count: 7, trend: 15 }
      ];
    },
    enabled: !!profile?.organization_id
  });

  // Feed de atividades
  const { data: activities } = useQuery({
    queryKey: ['activity-feed', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const activities = [];
      
      // Adicionar atividades de chat recentes
      if (recentSessions && recentSessions.length > 0) {
        recentSessions.slice(0, 5).forEach(session => {
          activities.push({
            id: `chat-${session.id}`,
            type: 'chat' as const,
            description: `Nova sessão de chat ${session.specialty ? `em ${session.specialty}` : 'iniciada'}`,
            timestamp: session.created_at,
            metadata: { specialty: session.specialty }
          });
        });
      }
      
      // Ordenar por timestamp
      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    enabled: !!profile?.organization_id && !!recentSessions
  });

  return {
    todayMetrics,
    weeklyUsage,
    recentSessions,
    topFormulas,
    activities,
    isLoading: todayLoading || weeklyLoading || sessionsLoading
  };
};
