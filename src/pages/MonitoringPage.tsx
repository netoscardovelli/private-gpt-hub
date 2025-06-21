
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import SystemHealthDashboard from '@/components/monitoring/SystemHealthDashboard';

const MonitoringPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Apenas administradores podem acessar
  if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Monitoramento do Sistema</h1>
          <p className="text-slate-300">
            Acompanhe a saúde, performance e alertas do sistema em tempo real
          </p>
        </div>
        
        <SystemHealthDashboard />
      </div>
    </div>
  );
};

export default MonitoringPage;
