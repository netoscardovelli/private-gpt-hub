import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import SupportChat from "@/components/SupportChat";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showSupportChat, setShowSupportChat] = useState(false);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar para dashboard se usuário tem organização
  useEffect(() => {
    if (!loading && user && profile?.organization_id) {
      navigate('/dashboard');
    }
  }, [loading, user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Formula.AI</h1>
          <p className="text-xl mb-8 text-slate-300">
            Assistente farmacêutico inteligente para sua farmácia
          </p>
          
          <div className="space-y-6">
            {/* Login para usuários existentes */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3 text-emerald-400">Já tenho uma farmácia cadastrada</h3>
              <p className="text-slate-300 text-sm mb-4">
                Acesse diretamente o sistema da sua farmácia
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-lg"
              >
                Fazer Login
              </Button>
            </div>

            {/* Divisor */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-slate-700"></div>
              <span className="px-3 text-slate-500 text-sm">ou</span>
              <div className="flex-1 border-t border-slate-700"></div>
            </div>

            {/* Cadastro para novos usuários */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3 text-blue-400">Primeira vez aqui</h3>
              <p className="text-slate-300 text-sm mb-4">
                Crie sua conta e configure sua farmácia
              </p>
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white py-3 text-lg"
              >
                Criar Conta Gratuita
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-slate-500">
            <p>• Fórmulas personalizadas</p>
            <p>• Suporte 24/7</p>
            <p>• Relatórios detalhados</p>
          </div>
        </div>
      </div>
    );
  }

  // Se usuário não tem organização, mostrar opções apenas na primeira vez
  if (!profile?.organization_id) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Configuração Inicial</h1>
          <p className="text-xl mb-8 text-slate-300">
            Olá, <span className="text-emerald-400">{profile?.full_name || 'Usuário'}</span>! Vamos configurar sua conta.
          </p>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Como você quer usar o Formula.AI?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opção 1: Cadastrar Nova Farmácia */}
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                <h3 className="text-lg font-medium mb-3 text-emerald-400">Sou Proprietário de Farmácia</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Configure sua farmácia e convide médicos para usar o sistema
                </p>
                <ul className="text-xs text-slate-400 space-y-1 mb-4">
                  <li>• Gestão completa de fórmulas</li>
                  <li>• Convites para médicos</li>
                  <li>• Relatórios exclusivos</li>
                  <li>• Branding personalizado</li>
                </ul>
                <Button 
                  onClick={() => navigate('/pharmacy-onboarding')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Cadastrar Minha Farmácia
                </Button>
              </div>

              {/* Opção 2: Acessar como Usuário Individual */}
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <h3 className="text-lg font-medium mb-3 text-blue-400">Sou Médico/Profissional</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Use o assistente para consultas e fórmulas básicas
                </p>
                <ul className="text-xs text-slate-400 space-y-1 mb-4">
                  <li>• Consultas de fórmulas</li>
                  <li>• Suporte básico</li>
                  <li>• Limite de 50 consultas/dia</li>
                  <li>• Sem funcionalidades B2B</li>
                </ul>
                <Button 
                  onClick={() => {
                    // Usar o sistema mesmo sem organização
                    window.location.reload();
                  }}
                  variant="outline"
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                >
                  Continuar como Médico
                </Button>
              </div>
            </div>
          </div>

          <div className="text-slate-400 text-sm">
            <p>Esta configuração aparece apenas uma vez. Você pode alterá-la depois nas configurações.</p>
          </div>
        </div>
      </div>
    );
  }

  // Preparar dados do usuário para os componentes
  const userData = {
    id: user.id,
    name: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
    plan: 'free',
    dailyLimit: 50,
    usageToday: 0
  };

  if (showSupportChat) {
    return (
      <SupportChat 
        user={userData}
        onBack={() => setShowSupportChat(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <OnboardingBanner />
        <ChatInterface user={userData} />
      </main>
      
      {/* Botão flutuante para suporte */}
      <button
        onClick={() => setShowSupportChat(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        title="Chat de Suporte"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.126-.9L3 20l1.9-5.874A9.863 9.863 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
      </button>
    </div>
  );
};

export default Index;
