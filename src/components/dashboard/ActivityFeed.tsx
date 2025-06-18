
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, MessageSquare, Users, FlaskConical, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'chat' | 'user_join' | 'formula_add' | 'system';
  description: string;
  timestamp: string;
  metadata?: {
    specialty?: string;
    user_name?: string;
    formula_name?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return MessageSquare;
      case 'user_join':
        return Users;
      case 'formula_add':
        return FlaskConical;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'text-blue-500';
      case 'user_join':
        return 'text-green-500';
      case 'formula_add':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          Feed de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma atividade recente</p>
              <p className="text-slate-500 text-sm mt-1">
                As atividades do sistema aparecerão aqui
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className={`p-2 bg-slate-700 rounded-lg`}>
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      {activity.metadata?.specialty && (
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {activity.metadata.specialty}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
