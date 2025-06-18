
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPage = () => {
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

  // Verificar se o usuário tem permissões de admin
  const canAccessAdmin = profile?.role && ['admin', 'super_admin'].includes(profile.role);
  
  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="container mx-auto p-6">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Acesso Negado</h1>
            <p className="text-red-300">
              Você não tem permissões para acessar o painel administrativo.
            </p>
            <p className="text-sm text-red-400 mt-2">
              Role atual: {profile?.role || 'user'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
