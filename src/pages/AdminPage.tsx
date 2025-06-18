
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPage = () => {
  const { user, loading } = useAuth();
  const { hasPermission } = useRoles();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasPermission('canManageOrganizations')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-6">
        <AdminDashboard />
      </main>
    </div>
  );
};

export default AdminPage;
