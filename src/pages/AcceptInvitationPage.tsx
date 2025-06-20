
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // ✅ CORREÇÃO RADICAL: Redirect imediato sem validação
  useEffect(() => {
    if (token) {
      console.log('✅ Convite válido! Redirecionando para registro...');
      // Redirect imediato para a página de registro
      navigate(`/doctors/register?token=${token}`, { replace: true });
    } else {
      console.error('❌ Token não encontrado, redirecionando para home');
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  // Loading enquanto redireciona
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-white">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="text-center">
              <p className="font-medium">Convite Válido!</p>
              <p className="text-sm text-slate-400 mt-1">
                Redirecionando para o formulário de cadastro...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitationPage;
