
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';
import Header from '@/components/Header';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Criar objeto de usuário compatível com ChatInterface
  const userForChat = {
    id: user.id,
    name: profile?.full_name || user.email || 'Usuário',
    plan: 'free', // Será implementado com a integração do Stripe
    dailyLimit: 10,
    usageToday: 0
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <ChatInterface user={userForChat} />
    </div>
  );
};

export default Index;
