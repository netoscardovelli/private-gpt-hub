
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const FormulasFavoritesPage = () => {
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
          <h1 className="text-3xl font-bold text-white mb-2">Fórmulas Preferenciais</h1>
          <p className="text-slate-300">Suas fórmulas mais utilizadas e favoritas</p>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Buscar fórmulas preferenciais..." 
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Suas Fórmulas Favoritas
            </CardTitle>
            <CardDescription>
              Acesso rápido às fórmulas que você mais utiliza
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg mb-2">Nenhuma fórmula favorita ainda</p>
              <p className="text-slate-500">
                Marque fórmulas como favoritas durante o uso do chat para vê-las aqui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormulasFavoritesPage;
