
import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PricingSection from '@/components/PricingSection';
import ChatInterface from '@/components/ChatInterface';
import AuthModal from '@/components/AuthModal';
import CustomActives from '@/components/CustomActives';
import SupportChat from '@/components/SupportChat';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessageCircleQuestion } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'settings' | 'billing' | 'support'>('home');
  const { toast } = useToast();

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('chat');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('home');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentView('chat');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSelectPlan = (plan: string) => {
    if (isAuthenticated) {
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: `Upgrade para o plano ${plan} estará disponível em breve.`,
      });
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  const handleBillingClick = () => {
    setCurrentView('billing');
  };

  const handleChatClick = () => {
    setCurrentView('chat');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return isAuthenticated ? <ChatInterface user={user} /> : renderHome();
      case 'support':
        return isAuthenticated ? <SupportChat user={user} onBack={() => setCurrentView('settings')} /> : renderHome();
      case 'settings':
        return (
          <div className="min-h-screen bg-slate-900 p-8">
            <div className="container mx-auto max-w-4xl">
              <h1 className="text-3xl font-bold text-white mb-8">Configurações</h1>
              
              {/* Botão de ação no topo */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={() => setCurrentView('support')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <MessageCircleQuestion className="w-4 h-4 mr-2" />
                  Chat de Dúvidas
                </Button>
              </div>
              
              <div className="space-y-8">
                {/* Perfil do Usuário */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Perfil do Usuário</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Nome</label>
                      <div className="text-white">{user?.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Email</label>
                      <div className="text-white">{user?.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Plano atual</label>
                      <div className="text-blue-400 font-semibold">{user?.plan}</div>
                    </div>
                  </div>
                </div>

                {/* Ativos Personalizados */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <CustomActives />
                </div>
              </div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="min-h-screen bg-slate-900 p-8">
            <div className="container mx-auto max-w-2xl">
              <h1 className="text-3xl font-bold text-white mb-8">Assinatura e Cobrança</h1>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">Plano Atual: {user?.plan}</h2>
                <p className="text-slate-300 mb-6">
                  Gerencie sua assinatura e métodos de pagamento.
                </p>
                <PricingSection onSelectPlan={handleSelectPlan} />
              </div>
            </div>
          </div>
        );
      default:
        return renderHome();
    }
  };

  const renderHome = () => (
    <>
      <Hero onGetStarted={handleGetStarted} />
      <PricingSection onSelectPlan={handleSelectPlan} />
    </>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onSettingsClick={handleSettingsClick}
        onBillingClick={handleBillingClick}
        onChatClick={handleChatClick}
      />
      
      {renderCurrentView()}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
