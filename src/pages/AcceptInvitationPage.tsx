
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      console.log('✅ Redirecionando para registro com token:', token);
      navigate(`/doctors/register?token=${token}`, { replace: true });
    } else {
      console.log('❌ Token não encontrado, redirecionando para home');
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-white">
            {token ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="text-center">
                  <p className="font-medium">Convite Válido!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Redirecionando para o formulário de cadastro...
                  </p>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <div className="text-center">
                  <p className="font-medium">Verificando convite...</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Aguarde um momento
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitationPage;
