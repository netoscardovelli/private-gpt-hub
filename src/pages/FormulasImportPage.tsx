
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Import, Upload, FileText } from 'lucide-react';

const FormulasImportPage = () => {
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
          <h1 className="text-3xl font-bold text-white mb-2">Importação de Fórmulas</h1>
          <p className="text-slate-300">Importe fórmulas em lote para o sistema</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload de Arquivo
              </CardTitle>
              <CardDescription>
                Faça upload de um arquivo Excel ou CSV com suas fórmulas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 mb-4">Arraste o arquivo aqui ou clique para selecionar</p>
                <Button>Selecionar Arquivo</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Import className="w-5 h-5" />
                Histórico de Importações
              </CardTitle>
              <CardDescription>
                Visualize suas importações anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center py-8">
                Nenhuma importação realizada ainda
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormulasImportPage;
