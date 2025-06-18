
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import DoctorInvitationManager from '@/components/doctor/DoctorInvitationManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const DoctorsPage = () => {
  const { user, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Médicos</h1>
          <p className="text-slate-300">Gerencie os médicos parceiros da sua farmácia</p>
        </div>
        
        <div className="space-y-8">
          {/* Sistema de Convites */}
          <DoctorInvitationManager />
          
          {/* Lista de Médicos Ativos - Placeholder para próxima implementação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Médicos Ativos
              </CardTitle>
              <CardDescription>
                Médicos que já aceitaram o convite e estão usando o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 text-lg mb-2">Nenhum médico ativo ainda</p>
                <p className="text-slate-500">
                  Os médicos aparecerão aqui quando aceitarem seus convites
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
