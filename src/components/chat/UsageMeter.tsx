
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Crown, Star } from 'lucide-react';

interface UsageMeterProps {
  userTier: {
    tier_name: string;
    daily_limit: number;
    monthly_limit: number;
    cache_access: boolean;
  };
  usageStats: {
    queries_today: number;
    queries_this_month: number;
    streak_days: number;
  };
  usagePercentage: {
    daily: number;
    monthly: number;
  };
  remaining: {
    daily: number;
    monthly: number;
  };
}

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'pro': return <Zap className="w-3 h-3" />;
    case 'premium': return <Crown className="w-3 h-3" />;
    case 'enterprise': return <Star className="w-3 h-3" />;
    default: return null;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'free': return 'bg-slate-600';
    case 'pro': return 'bg-blue-600';
    case 'premium': return 'bg-purple-600';
    case 'enterprise': return 'bg-amber-600';
    default: return 'bg-slate-600';
  }
};

const UsageMeter = ({ userTier, usageStats, usagePercentage, remaining }: UsageMeterProps) => {
  const isLimitApproaching = usagePercentage.daily > 80;
  const isLimitCritical = usagePercentage.daily > 95;

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-3">
      {/* Header com tier */}
      <div className="flex items-center justify-between">
        <Badge className={`${getTierColor(userTier.tier_name)} text-white`}>
          {getTierIcon(userTier.tier_name)}
          <span className="ml-1 capitalize">{userTier.tier_name}</span>
        </Badge>
        
        {userTier.cache_access && (
          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
            Cache Ativo
          </Badge>
        )}
      </div>

      {/* Uso diário */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Uso Diário</span>
          <span className={`font-medium ${
            isLimitCritical ? 'text-red-400' : 
            isLimitApproaching ? 'text-amber-400' : 
            'text-slate-300'
          }`}>
            {usageStats.queries_today} / {userTier.daily_limit}
          </span>
        </div>
        
        <Progress 
          value={usagePercentage.daily} 
          className="h-2"
        />
        
        <div className="text-xs text-slate-400">
          {remaining.daily} consultas restantes hoje
        </div>
      </div>

      {/* Uso mensal */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Uso Mensal</span>
          <span className="text-slate-300 font-medium">
            {usageStats.queries_this_month} / {userTier.monthly_limit}
          </span>
        </div>
        
        <Progress 
          value={usagePercentage.monthly} 
          className="h-1"
        />
      </div>

      {/* Streak */}
      {usageStats.streak_days > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>🔥 Sequência: {usageStats.streak_days} dias</span>
        </div>
      )}

      {/* Avisos */}
      {isLimitCritical && (
        <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
          ⚠️ Limite quase esgotado. Considere fazer upgrade.
        </div>
      )}
      
      {isLimitApproaching && !isLimitCritical && (
        <div className="text-xs text-amber-400 bg-amber-900/20 p-2 rounded">
          💡 Você está próximo do limite diário.
        </div>
      )}
    </div>
  );
};

export default UsageMeter;
