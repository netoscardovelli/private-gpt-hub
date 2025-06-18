import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { monitoring } from '@/services/MonitoringService';
import { Button } from '@/components/ui/button';

interface UserTier {
  tier_name: 'free' | 'pro' | 'premium' | 'enterprise';
  daily_limit: number;
  monthly_limit: number;
  priority_bonus: number;
  cache_access: boolean;
}

interface UsageStats {
  queries_today: number;
  queries_this_month: number;
  streak_days: number;
  avg_daily: number;
}

export const useSmartLimits = () => {
  const { user } = useAuth();
  console.log('🔧 useSmartLimits hook inicializado para userId:', user?.id);
  
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar tier e estatísticas do usuário
  useEffect(() => {
    if (user?.id) {
      console.log('🔧 UUID válido, carregando dados do usuário...');
      loadUserData();
    } else {
      console.log('🔧 User não disponível:', user?.id);
      setLoading(false);
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔧 Iniciando loadUserData...');
      setLoading(true);

      // Buscar ou criar tier do usuário
      console.log('🔧 Buscando tier do usuário...');
      const { data: tier, error: tierError } = await supabase
        .from('user_tiers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tierError && tierError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar tier:', tierError);
        throw tierError;
      }

      if (!tier) {
        console.log('🔧 Criando tier padrão para usuário novo...');
        // Criar tier padrão para usuário novo
        const { data: newTier } = await supabase
          .from('user_tiers')
          .insert({
            user_id: user.id,
            tier_name: 'free',
            daily_limit: 10,
            monthly_limit: 200,
            priority_bonus: 0,
            cache_access: false
          })
          .select()
          .single();

        if (newTier) {
          console.log('✅ Novo tier criado:', newTier);
          setUserTier({
            tier_name: newTier.tier_name as 'free' | 'pro' | 'premium' | 'enterprise',
            daily_limit: newTier.daily_limit,
            monthly_limit: newTier.monthly_limit,
            priority_bonus: newTier.priority_bonus,
            cache_access: newTier.cache_access
          });
        }
      } else {
        console.log('✅ Tier encontrado:', tier);
        setUserTier({
          tier_name: tier.tier_name as 'free' | 'pro' | 'premium' | 'enterprise',
          daily_limit: tier.daily_limit,
          monthly_limit: tier.monthly_limit,
          priority_bonus: tier.priority_bonus,
          cache_access: tier.cache_access
        });
      }

      // Buscar estatísticas de uso
      console.log('🔧 Buscando estatísticas de uso...');
      const { data: stats, error: statsError } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar stats:', statsError);
        throw statsError;
      }

      if (!stats) {
        console.log('🔧 Criando estatísticas para hoje...');
        // Criar estatísticas para hoje
        const { data: newStats } = await supabase
          .from('usage_stats')
          .insert({
            user_id: user.id,
            queries_today: 0,
            queries_this_month: 0,
            streak_days: 0,
            avg_daily: 0
          })
          .select()
          .single();

        if (newStats) {
          console.log('✅ Novas stats criadas:', newStats);
          setUsageStats({
            queries_today: newStats.queries_today,
            queries_this_month: newStats.queries_this_month,
            streak_days: newStats.streak_days,
            avg_daily: newStats.avg_daily
          });
        }
      } else {
        console.log('✅ Stats encontradas:', stats);
        setUsageStats({
          queries_today: stats.queries_today,
          queries_this_month: stats.queries_this_month,
          streak_days: stats.streak_days,
          avg_daily: stats.avg_daily
        });
      }

      console.log('✅ loadUserData concluído com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar informações do usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAndConsumeLimit = async (): Promise<boolean> => {
    if (!userTier || !usageStats) {
      return false;
    }

    // Verificar limite diário
    if (usageStats.queries_today >= userTier.daily_limit) {
      await monitoring.trackEvent('limit_exceeded', {
        type: 'daily',
        tier: userTier.tier_name,
        current: usageStats.queries_today,
        limit: userTier.daily_limit
      });

      showUpgradeOffer('daily');
      return false;
    }

    // Verificar limite mensal
    if (usageStats.queries_this_month >= userTier.monthly_limit) {
      await monitoring.trackEvent('limit_exceeded', {
        type: 'monthly',
        tier: userTier.tier_name,
        current: usageStats.queries_this_month,
        limit: userTier.monthly_limit
      });

      showUpgradeOffer('monthly');
      return false;
    }

    // Consumir uma query
    await incrementUsage();
    return true;
  };

  const incrementUsage = async () => {
    if (!usageStats || !user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Atualizar estatísticas
      const { data: updatedStats } = await supabase
        .from('usage_stats')
        .update({
          queries_today: usageStats.queries_today + 1,
          queries_this_month: usageStats.queries_this_month + 1,
          last_query_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', today)
        .select()
        .single();

      if (updatedStats) {
        setUsageStats({
          queries_today: updatedStats.queries_today,
          queries_this_month: updatedStats.queries_this_month,
          streak_days: updatedStats.streak_days,
          avg_daily: updatedStats.avg_daily
        });
      }

      // Log da query
      await monitoring.trackEvent('query_consumed', {
        tier: userTier?.tier_name,
        dailyUsage: usageStats.queries_today + 1,
        monthlyUsage: usageStats.queries_this_month + 1
      });

    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
    }
  };

  const showUpgradeOffer = (limitType: 'daily' | 'monthly') => {
    const upgradeMessages = {
      free: {
        daily: 'Limite diário de 10 consultas atingido! Upgrade para Pro e tenha 50 consultas por dia.',
        monthly: 'Limite mensal de 200 consultas atingido! Upgrade para Pro e tenha acesso ilimitado.'
      },
      pro: {
        daily: 'Limite diário de 50 consultas atingido! Upgrade para Premium e tenha acesso ilimitado.',
        monthly: 'Limite mensal atingido! Upgrade para Premium e tenha acesso ilimitado.'
      }
    };

    const tierMessages = upgradeMessages[userTier?.tier_name as 'free' | 'pro'];
    
    if (tierMessages) {
      toast({
        title: "Limite atingido",
        description: tierMessages[limitType],
        variant: "destructive",
        action: (
          <Button 
            size="sm"
            onClick={() => window.open('/upgrade', '_blank')}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Fazer Upgrade
          </Button>
        )
      });
    }
  };

  const upgradeTier = async (newTier: UserTier['tier_name']) => {
    if (!userTier || !user?.id) return;

    const tierLimits = {
      free: { daily_limit: 10, monthly_limit: 200, cache_access: false },
      pro: { daily_limit: 50, monthly_limit: 1000, cache_access: true },
      premium: { daily_limit: 200, monthly_limit: 5000, cache_access: true },
      enterprise: { daily_limit: 1000, monthly_limit: 20000, cache_access: true }
    };

    try {
      const { data: updatedTier } = await supabase
        .from('user_tiers')
        .update({
          tier_name: newTier,
          ...tierLimits[newTier],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updatedTier) {
        setUserTier({
          tier_name: updatedTier.tier_name as 'free' | 'pro' | 'premium' | 'enterprise',
          daily_limit: updatedTier.daily_limit,
          monthly_limit: updatedTier.monthly_limit,
          priority_bonus: updatedTier.priority_bonus,
          cache_access: updatedTier.cache_access
        });
        
        await monitoring.trackEvent('user_upgrade', {
          fromTier: userTier.tier_name,
          toTier: newTier,
          userId: user.id
        });

        toast({
          title: "Upgrade realizado!",
          description: `Seu plano foi atualizado para ${newTier.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Erro no upgrade:', error);
      toast({
        title: "Erro no upgrade",
        description: "Falha ao atualizar o plano",
        variant: "destructive"
      });
    }
  };

  const getRemainingQueries = () => {
    if (!userTier || !usageStats) return { daily: 0, monthly: 0 };

    return {
      daily: Math.max(0, userTier.daily_limit - usageStats.queries_today),
      monthly: Math.max(0, userTier.monthly_limit - usageStats.queries_this_month)
    };
  };

  const canUseCache = () => {
    return userTier?.cache_access || false;
  };

  const getUsagePercentage = () => {
    if (!userTier || !usageStats) return { daily: 0, monthly: 0 };

    return {
      daily: (usageStats.queries_today / userTier.daily_limit) * 100,
      monthly: (usageStats.queries_this_month / userTier.monthly_limit) * 100
    };
  };

  return {
    userTier,
    usageStats,
    loading,
    checkAndConsumeLimit,
    upgradeTier,
    getRemainingQueries,
    canUseCache,
    getUsagePercentage,
    refreshData: loadUserData
  };
};
