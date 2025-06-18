
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  bgColor?: string;
}

const MetricsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  color = 'text-blue-500',
  bgColor = 'bg-blue-500/10'
}: MetricsCardProps) => {
  return (
    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-slate-500 ml-1">vs último mês</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
