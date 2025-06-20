
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, UserPlus } from 'lucide-react';
import { useValidateInvitation } from '@/hooks/useValidateInvitation';

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const { invitation, isLoading, error, validateInvitation } = useValidateInvitation();

  useEffect(() => {
    if (token) {
      console.log('🔗 Token encontrado no URL:', token);
      validateInvitation(token);
    }
  }, [token, validateInvitation]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Link Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              O link de convite está incompleto ou inválido.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Validando convite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Erro no Convite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              {error || 'Este convite não é válido ou já expirou.'}
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Voltar ao Início
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="w-5 h-5 text-green-500" />
            Convite para Médico
          </CardTitle>
          <CardDescription>
            Você foi convidado(a) para se juntar à {invitation.organization?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="font-medium mb-3 text-white">📋 Detalhes do Convite</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Email:</span>
                <span className="text-white">{invitation.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Farmácia:</span>
                <span className="text-white">{invitation.organization?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Válido até:</span>
                <span className="text-white">
                  {new Date(invitation.expires_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 p-4 rounded-lg border border-green-700">
            <h4 className="font-medium mb-2 text-green-400">✨ Próximos Passos</h4>
            <p className="text-sm text-green-300">
              Clique no botão abaixo para criar sua conta e começar a usar o sistema da farmácia.
            </p>
          </div>

          <Button 
            onClick={() => navigate(`/doctors/register?token=${token}`)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Aceitar Convite e Criar Conta
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitationPage;
