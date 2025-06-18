
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, User } from 'lucide-react';

interface RecentActivityProps {
  recentSessions: any[];
}

const RecentActivity = ({ recentSessions }: RecentActivityProps) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      'Endocrinologia': 'bg-blue-500',
      'Dermatologia': 'bg-green-500',
      'Cardiologia': 'bg-red-500',
      'Neurologia': 'bg-purple-500',
      'Ortopedia': 'bg-orange-500',
      'default': 'bg-gray-500'
    };
    return colors[specialty as keyof typeof colors] || colors.default;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhuma atividade recente</p>
            <p className="text-slate-500 text-sm mt-1">
              As consultas aparecerão aqui quando os usuários começarem a usar o sistema
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Sessão de Chat</p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(session.created_at)}</span>
                      {session.specialty && (
                        <>
                          <span>•</span>
                          <Badge 
                            className={`${getSpecialtyColor(session.specialty)} text-white text-xs`}
                          >
                            {session.specialty}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 font-medium">{session.message_count || 0} msgs</p>
                  {session.total_tokens_used > 0 && (
                    <p className="text-slate-500 text-xs">{session.total_tokens_used} tokens</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
