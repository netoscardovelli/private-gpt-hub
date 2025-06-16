
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
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      {!showChat ? (
        <>
          <Hero onStartChat={() => setShowChat(true)} />
          <PricingSection />
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
              <ChatInterface />
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

      <AuthModal />
      <SupportChat />
      <Toaster />
    </div>
  );
};

export default Index;
