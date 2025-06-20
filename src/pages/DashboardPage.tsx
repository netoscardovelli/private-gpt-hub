
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import OrganizationInfo from '@/components/dashboard/OrganizationInfo';
import QuickActions from '@/components/dashboard/QuickActions';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const DashboardPage = () => {
  const { profile } = useAuth();
  const { organizationData, isLoading: orgLoading } = useDashboardData();

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2 bg-slate-700" />
            <Skeleton className="h-4 w-96 bg-slate-700" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-4 bg-slate-700" />
                  <Skeleton className="h-8 w-16 bg-slate-700" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 bg-slate-700 rounded-lg" />
            <Skeleton className="h-96 bg-slate-700 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {profile?.full_name || 'Usuário'}!
          </h1>
          <p className="text-slate-300">
            {organizationData?.name ? 
              `Acompanhe o desempenho da ${organizationData.name} através do painel de controle.` :
              'Acompanhe o desempenho da sua farmácia através do painel de controle.'
            }
          </p>
        </div>

        {/* Métricas do Dashboard */}
        <div className="mb-8">
          <DashboardMetrics />
        </div>

        {/* Informações da Organização e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <OrganizationInfo organizationData={organizationData} />
          <div>
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
