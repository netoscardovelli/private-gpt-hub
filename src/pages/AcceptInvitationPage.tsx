
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, UserPlus, RefreshCw, Clock } from 'lucide-react';
import { useValidateInvitation } from '@/hooks/useValidateInvitation';

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const { invitation, isLoading, error, validateInvitation, retry } = useValidateInvitation();
  const [isRetrying, setIsRetrying] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [hasValidated, setHasValidated] = useState(false); // Controle para evitar loop

  // Debug: Log do token para verificação
  useEffect(() => {
    if (token) {
      console.log('🔗 Token encontrado no URL:', token);
      console.log('🔗 Token length:', token.length);
      console.log('🔗 Token format valid:', /^[a-zA-Z0-9\-_]+$/.test(token));
      setDebugInfo(`Token: ${token.substring(0, 20)}...`);
    } else {
      console.error('❌ Nenhum token encontrado na URL');
      setDebugInfo('Nenhum token na URL');
    }
  }, [token]);

  // Validar token apenas uma vez quando a página carrega
  useEffect(() => {
    if (token && !hasValidated && !invitation && !isLoading && !error) {
      console.log('🚀 Iniciando validação do token (primeira vez):', token);
      setHasValidated(true); // Marca como validado ANTES de chamar a função
      validateInvitation(token);
    }
  }, [token, hasValidated, invitation, isLoading, error, validateInvitation]);

  // Função para tentar novamente com loading
  const handleRetry = async () => {
    if (!token) return;
    
    setIsRetrying(true);
    setHasValidated(false); // Reset para permitir nova tentativa
    try {
      await retry();
    } catch (err) {
      console.error('Erro ao tentar novamente:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  // Verificar se o convite expirou
  const isExpired = invitation?.expires_at ? 
    new Date(invitation.expires_at) <= new Date() : false;

  // Função para formatar data com fallback
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Caso não tenha token
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Link Inválido
            </CardTitle>
            <CardDescription className="text-slate-400">
              O link de convite está incompleto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-900/20 p-3 rounded-lg border border-red-700">
              <p className="text-red-300 text-sm">
                ❌ Token de convite não encontrado na URL
              </p>
              <p className="text-red-400 text-xs mt-1">
                Verifique se o link foi copiado corretamente
              </p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Voltar ao Início
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <div className="text-center">
                <p className="font-medium">Validando convite...</p>
                <p className="text-sm text-slate-400 mt-1">
                  Verificando dados no servidor
                </p>
              </div>
              {debugInfo && (
                <div className="bg-slate-800 p-2 rounded text-xs text-slate-400 w-full">
                  Debug: {debugInfo}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Problema com o Convite
            </CardTitle>
            <CardDescription className="text-slate-400">
              Não foi possível validar o convite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-900/20 p-3 rounded-lg border border-red-700">
              <p className="text-red-300 text-sm font-medium mb-2">
                ❌ Erro encontrado:
              </p>
              <p className="text-red-400 text-sm">
                {error || 'Convite não encontrado ou já expirou'}
              </p>
            </div>

            {/* Debug info */}
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
              <p className="text-slate-300 text-xs font-medium mb-2">
                🔧 Informações de Debug:
              </p>
              <div className="space-y-1 text-xs text-slate-400">
                <p>Token: {token ? `${token.substring(0, 20)}...` : 'Não encontrado'}</p>
                <p>Timestamp: {new Date().toLocaleString('pt-BR')}</p>
                <p>URL atual: {window.location.href}</p>
              </div>
            </div>

            {/* Possíveis soluções */}
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-700">
              <p className="text-blue-300 text-sm font-medium mb-2">
                💡 Possíveis soluções:
              </p>
              <ul className="text-blue-400 text-sm space-y-1">
                <li>• Verifique se o link não foi quebrado ao copiar</li>
                <li>• Confirme se o convite não expirou (7 dias)</li>
                <li>• Tente acessar o link original do email</li>
                <li>• Entre em contato com quem enviou o convite</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tentando novamente...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convite expirado
  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Clock className="w-5 h-5" />
              Convite Expirado
            </CardTitle>
            <CardDescription className="text-slate-400">
              Este convite não é mais válido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-700">
              <p className="text-yellow-300 text-sm">
                ⏰ Este convite expirou em {formatDate(invitation.expires_at)}
              </p>
              <p className="text-yellow-400 text-xs mt-1">
                Entre em contato com a farmácia para solicitar um novo convite
              </p>
            </div>

            <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
              <h4 className="font-medium mb-2 text-slate-300">📋 Detalhes do Convite</h4>
              <div className="space-y-1 text-sm text-slate-400">
                <p>Email: {invitation.email}</p>
                <p>Farmácia: {invitation.organization?.name || 'N/A'}</p>
                <p>Expirou: {formatDate(invitation.expires_at)}</p>
              </div>
            </div>
            
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convite válido - Estado de sucesso
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Convite Válido!
          </CardTitle>
          <CardDescription className="text-slate-400">
            Você foi convidado(a) para se juntar à {invitation.organization?.name || 'farmácia'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status do convite */}
          <div className="bg-green-900/20 p-3 rounded-lg border border-green-700">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Convite Confirmado</span>
            </div>
            <p className="text-green-300 text-sm">
              Todas as verificações foram aprovadas. Você pode prosseguir com o cadastro.
            </p>
          </div>

          {/* Detalhes do convite */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="font-medium mb-3 text-white">📋 Detalhes do Convite</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Email:</span>
                <span className="text-white">{invitation.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Farmácia:</span>
                <span className="text-white">{invitation.organization?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Válido até:</span>
                <span className="text-white">
                  {formatDate(invitation.expires_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Próximos passos */}
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
            <h4 className="font-medium mb-2 text-blue-400 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Próximos Passos
            </h4>
            <p className="text-sm text-blue-300 mb-3">
              Para completar seu cadastro na plataforma, você precisa:
            </p>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Criar sua senha pessoal</li>
              <li>• Confirmar seus dados profissionais</li>
              <li>• Aceitar os termos de uso</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                console.log('🚀 Redirecionando para registro com token:', token);
                navigate(`/doctors/register?token=${token}`);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitationPage;
