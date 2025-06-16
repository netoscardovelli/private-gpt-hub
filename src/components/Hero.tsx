import { Button } from '@/components/ui/button';
import { ArrowRight, FlaskConical, Shield, Sparkles, Beaker, CheckCircle, Settings, Star, Zap, Atom, Instagram } from 'lucide-react';

interface HeroProps {
  onGetStarted?: () => void;
  onStartChat?: () => void;
}

const Hero = ({ onGetStarted, onStartChat }: HeroProps) => {
  const handleStartClick = onStartChat || onGetStarted || (() => {});

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 overflow-hidden px-4">
      {/* Simplified Background Elements for mobile */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-4 w-2 h-2 bg-emerald-400 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute top-32 right-4 w-3 h-3 bg-green-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-4 w-2 h-2 bg-emerald-300 rounded-full animate-bounce opacity-80" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-60 right-8 w-1 h-1 bg-green-300 rounded-full animate-bounce opacity-90" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='45' cy='45' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="container mx-auto py-8 sm:py-12 lg:py-20 relative z-10 max-w-6xl">
        <div className="text-center">
          {/* Dr. Neto Section - Completely restructured for mobile */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-emerald-500/20 shadow-2xl">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-yellow-800" />
                  </div>
                </div>
                
                {/* Title */}
                <div className="text-center space-y-1 sm:space-y-2">
                  <h2 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-white leading-tight">
                    Treinado pelo Dr. Neto Scardovelli
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-emerald-300 font-medium">
                    Especialista em Fórmulas Magistrais
                  </p>
                </div>

                {/* Social Media */}
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-600/30">
                  <span className="text-slate-300 text-xs">Siga-me:</span>
                  <a 
                    href="https://instagram.com/netoscardovelli" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors duration-200 font-semibold"
                  >
                    <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs">@netoscardovelli</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Title - Completely responsive */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
                ANÁLISE DE FÓRMULAS MAGISTRAIS
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
            IA TREINADA POR MÉDICO PARA AUXILIAR NO SEU DIA A DIA DO CONSULTÓRIO
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center mb-12 sm:mb-16 lg:mb-20 px-2">
            <Button 
              size="lg" 
              onClick={handleStartClick}
              className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 border border-emerald-400/30 w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              <Zap className="mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
              Começar Análise
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-slate-400 text-slate-300 hover:bg-slate-800 hover:border-emerald-400 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300 w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              <Beaker className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Ver Exemplos
            </Button>
          </div>

          {/* Features Grid - Mobile optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-2">
            {[
              {
                icon: FlaskConical,
                title: "Análise de Fórmulas",
                description: "Análise completa de composições e sinergias entre ativos"
              },
              {
                icon: Beaker,
                title: "Sugestão de Fórmulas", 
                description: "Formulações personalizadas baseadas em evidências científicas"
              },
              {
                icon: CheckCircle,
                title: "Compatibilidade",
                description: "Verificação de interações entre ativos e excipientes"
              },
              {
                icon: Settings,
                title: "Otimização",
                description: "Melhore concentrações e formas farmacêuticas"
              }
            ].map((feature, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-2 sm:mb-3 group-hover:text-emerald-300 transition-colors leading-tight">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-400 leading-relaxed px-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-slate-800 to-transparent"></div>
    </section>
  );
};

export default Hero;
