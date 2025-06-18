
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cadastro de Médicos</h1>
            <p className="text-slate-300">Gerencie os médicos parceiros da farmácia</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Médico
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar médicos por nome, CRM ou especialidade..." 
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Médicos Cadastrados
            </CardTitle>
            <CardDescription>
              Lista de médicos parceiros da farmácia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg mb-2">Nenhum médico cadastrado ainda</p>
              <p className="text-slate-500 mb-6">
                Comece cadastrando os médicos parceiros da sua farmácia
              </p>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Médico
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorsPage;
