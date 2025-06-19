
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import SupportChat from "@/components/SupportChat";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import { useAuth } from "@/hooks/useAuth";

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
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Formula.AI</h1>
          <p className="text-xl mb-8">Faça login para acessar o sistema</p>
          <a 
            href="/auth" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  // Se usuário não tem organização, mostrar onboarding
  if (!profile?.organization_id) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Formula.AI!</h1>
          <p className="text-xl mb-8 text-slate-300">
            Para começar a usar nosso assistente farmacêutico, primeiro você precisa cadastrar sua farmácia.
          </p>
          <button 
            onClick={() => navigate('/pharmacy-onboarding')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
          >
            Cadastrar Minha Farmácia
          </button>
        </div>
      </div>
    );
  }

  // Preparar dados do usuário para os componentes
  const userData = {
    id: user.id,
    name: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
    plan: 'free', // Por enquanto fixo, depois vem da subscription
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
