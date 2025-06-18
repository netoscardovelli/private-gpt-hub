
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ActivesFavoritesPage = () => {
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
          <h1 className="text-3xl font-bold text-white mb-2">Ativos Preferenciais</h1>
          <p className="text-slate-300">Seus princípios ativos mais utilizados</p>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar ativos preferenciais..." 
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-500" />
              Seus Ativos Preferidos
            </CardTitle>
            <CardDescription>
              Princípios ativos que você mais utiliza nas formulações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg mb-2">Nenhum ativo preferencial ainda</p>
              <p className="text-slate-500">
                Use o chat para criar fórmulas e seus ativos mais usados aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivesFavoritesPage;
