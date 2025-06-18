
import { MessageSquare, Users, FlaskConical, TrendingUp, Calendar, Activity } from 'lucide-react';
import MetricsCard from './MetricsCard';
import UsageChart from './UsageChart';
import TopFormulas from './TopFormulas';
import ActivityFeed from './ActivityFeed';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const DashboardMetrics = () => {
  const { 
    todayMetrics, 
    weeklyUsage, 
    topFormulas, 
    activities, 
    isLoading 
  } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton para cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4 bg-slate-700" />
                <Skeleton className="h-8 w-16 bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton para gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 bg-slate-700 rounded-lg" />
          <Skeleton className="h-96 bg-slate-700 rounded-lg" />
        </div>
      </div>
    );
  }

  const metricsData = [
    {
      title: 'Consultas Hoje',
      value: todayMetrics?.queries_today || 0,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Consultas realizadas hoje'
    },
    {
      title: 'Este Mês',
      value: todayMetrics?.queries_this_month || 0,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'Total de consultas no mês'
    },
    {
      title: 'Média Diária',
      value: Math.round((todayMetrics?.queries_this_month || 0) / new Date().getDate()),
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Média de consultas por dia'
    },
    {
      title: 'Atividade',
      value: activities?.length || 0,
      icon: Activity,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'Atividades recentes'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            bgColor={metric.bgColor}
            description={metric.description}
          />
        ))}
      </div>

      {/* Gráficos e Dados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageChart data={weeklyUsage || []} />
        <TopFormulas formulas={topFormulas || []} />
      </div>

      {/* Feed de Atividades */}
      <ActivityFeed activities={activities || []} />
    </div>
  );
};

export default DashboardMetrics;
