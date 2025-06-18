
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useDashboardData = () => {
  const { profile } = useAuth();

  const { data: organizationData, isLoading: organizationLoading } = useQuery({
    queryKey: ['organization-data', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id
  });

  const { data: todayStats, isLoading: statsLoading } = useQuery({
    queryKey: ['today-stats', profile?.organization_id],
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

  const { data: doctorCount, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctor-count', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 0;
      
      const { count, error } = await supabase
        .from('doctor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.organization_id
  });

  const { data: formulaCount, isLoading: formulasLoading } = useQuery({
    queryKey: ['formula-count', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 0;
      
      const { count, error } = await supabase
        .from('reference_formulas')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.organization_id
  });

  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['recent-sessions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  return {
    organizationData,
    todayStats,
    doctorCount,
    formulaCount,
    recentSessions,
    isLoading: organizationLoading || statsLoading || doctorsLoading || formulasLoading || sessionsLoading
  };
};
