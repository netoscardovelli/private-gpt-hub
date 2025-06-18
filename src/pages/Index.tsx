
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import PricingSection from "@/components/PricingSection";
import SupportChat from "@/components/SupportChat";
import AuthModal from "@/components/AuthModal";
import CustomActives from "@/components/CustomActives";
import FormulaDatabase from "@/components/FormulaDatabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  console.log('🏠 Index component renderizando...');
  
  const [showChat, setShowChat] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);

  // Mock user data - agora com UUID válido
  const mockUser = {
    id: "550e8400-e29b-41d4-a716-446655440000", // UUID válido
    name: "Neto Scardovelli",
    plan: "Free",
    dailyLimit: 10,
    usageToday: 2
  };

  console.log('🏠 Estado atual:', {
    showChat,
    isAuthenticated,
    showAuthModal,
    showSupportChat
  });

  const handleLogin = () => {
    console.log('🔐 Login executado');
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    console.log('🚪 Logout executado');
    setIsAuthenticated(false);
    setShowChat(false);
  };

  const handleStartChat = () => {
    console.log('💬 Iniciar chat clicado, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowChat(true);
    }
  };

  const handleChatClick = () => {
    console.log('Chat button clicked, isAuthenticated:', isAuthenticated, 'showChat:', showChat);
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      // Se já estamos no chat, não fazer nada ou voltar ao início
      if (showChat) {
        console.log('Already in chat, staying in chat');
      } else {
        setShowChat(true);
      }
    }
  };

  const handleSelectPlan = (plan: string) => {
    console.log('Selected plan:', plan);
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
        isAuthenticated={isAuthenticated}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onSettingsClick={handleSettingsClick}
        onSupportClick={handleSupportClick}
        onChatClick={handleChatClick}
        userName={isAuthenticated ? mockUser.name : undefined}
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

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
      <Toaster />
    </div>
  );
};

export default Index;
