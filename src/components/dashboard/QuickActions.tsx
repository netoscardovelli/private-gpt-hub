
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  FlaskConical, 
  Settings, 
  Import, 
  BarChart3, 
  MessageSquare 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Iniciar Chat',
      description: 'Conversar com a IA farmacêutica',
      icon: MessageSquare,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/')
    },
    {
      title: 'Convidar Médicos',
      description: 'Adicionar médicos parceiros',
      icon: UserPlus,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => navigate('/doctors')
    },
    {
      title: 'Gerenciar Fórmulas',
      description: 'Importar e organizar fórmulas',
      icon: FlaskConical,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => navigate('/formulas/import')
    },
    {
      title: 'Configurações',
      description: 'Personalizar o sistema',
      icon: Settings,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => navigate('/settings/customization')
    },
    {
      title: 'Analytics',
      description: 'Ver relatórios e métricas',
      icon: BarChart3,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      onClick: () => navigate('/analytics')
    },
    {
      title: 'Importar Dados',
      description: 'Importar fórmulas em lote',
      icon: Import,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => navigate('/formulas/import')
    }
  ];

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-start gap-2 border-slate-600 hover:border-slate-500 text-left ${action.color} border-0 text-white`}
              onClick={action.onClick}
            >
              <action.icon className="w-6 h-6" />
              <div>
                <h4 className="font-medium">{action.title}</h4>
                <p className="text-sm text-white/80">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
