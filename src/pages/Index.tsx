
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import PricingSection from "@/components/PricingSection";
import SupportChat from "@/components/SupportChat";
import CustomActives from "@/components/CustomActives";
import FormulaDatabase from "@/components/FormulaDatabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/hooks/useSubscription";

const Index = () => {
  console.log('🏠 Index component renderizando...');
  
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { createCheckoutSession } = useSubscription();
  const [showChat, setShowChat] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);

  console.log('🏠 Estado atual:', {
    user: !!user,
    profile,
    showChat,
    showSupportChat,
    authLoading
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">FA</span>
          </div>
          <p className="text-emerald-700">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const mockUser = {
    id: user.id,
    name: profile?.full_name || user.email?.split('@')[0] || "Usuário",
    plan: "Free",
    dailyLimit: 10,
    usageToday: 2
  };

  const handleLogin = () => {
    // Not needed anymore - handled by auth system
  };

  const handleLogout = () => {
    console.log('🚪 Logout executado');
    signOut();
    setShowChat(false);
  };

  const handleStartChat = () => {
    console.log('💬 Iniciar chat clicado');
    setShowChat(true);
  };

  const handleChatClick = () => {
    console.log('Chat button clicked, showChat:', showChat);
    if (showChat) {
      console.log('Already in chat, staying in chat');
    } else {
      setShowChat(true);
    }
  };

  const handleSelectPlan = (plan: string) => {
    console.log('Selected plan:', plan);
    // Get price ID based on plan
    const priceIds = {
      'pro': 'price_1234567890', // Replace with actual Stripe price IDs
      'premium': 'price_0987654321',
      'enterprise': 'price_1122334455'
    };
    
    const priceId = priceIds[plan as keyof typeof priceIds];
    if (priceId && profile?.organization_id) {
      createCheckoutSession(priceId);
    }
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleSupportClick = () => {
    console.log('🆘 Support clicado');
    setShowSupportChat(true);
  };

  if (showSupportChat) {
    console.log('🆘 Renderizando SupportChat');
    return (
      <SupportChat 
        user={mockUser}
        onBack={() => setShowSupportChat(false)}
      />
    );
  }

  console.log('🏠 Renderizando tela principal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-green-100">
      <Header 
        isAuthenticated={true}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSettingsClick={handleSettingsClick}
        onSupportClick={handleSupportClick}
        onChatClick={handleChatClick}
        userName={mockUser.name}
      />
      
      {!showChat ? (
        <>
          <Hero onStartChat={handleStartChat} />
          <PricingSection onSelectPlan={handleSelectPlan} />
        </>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat AI</TabsTrigger>
              <TabsTrigger value="actives">Ativos Personalizados</TabsTrigger>
              <TabsTrigger value="formulas">Banco de Fórmulas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-6">
              <ChatInterface user={mockUser} />
            </TabsContent>
            
            <TabsContent value="actives" className="mt-6">
              <CustomActives />
            </TabsContent>
            
            <TabsContent value="formulas" className="mt-6">
              <FormulaDatabase />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default Index;
