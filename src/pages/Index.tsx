
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import SupportChat from "@/components/SupportChat";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <OnboardingBanner />
        <ChatInterface />
      </main>
      <SupportChat />
    </div>
  );
};

export default Index;
