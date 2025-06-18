
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FlaskConical, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  organizationData: any;
  todayStats: any;
  doctorCount: number;
  formulaCount: number;
  recentSessions: any[];
}

const DashboardStats = ({ 
  organizationData, 
  todayStats, 
  doctorCount, 
  formulaCount,
  recentSessions 
}: DashboardStatsProps) => {
  const stats = [
    {
      title: 'Consultas Hoje',
      value: todayStats?.queries_today || 0,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Consultas Este Mês',
      value: todayStats?.queries_this_month || 0,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Médicos Parceiros',
      value: doctorCount,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Fórmulas Cadastradas',
      value: formulaCount,
      icon: FlaskConical,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
