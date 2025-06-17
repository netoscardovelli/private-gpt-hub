
import { Button } from '@/components/ui/button';
import { ArrowRight, FlaskConical, Shield, Sparkles, Beaker, CheckCircle, Settings, Star, Zap, Atom } from 'lucide-react';

interface HeroProps {
  onGetStarted?: () => void;
  onStartChat?: () => void;
}

const Hero = ({ onGetStarted, onStartChat }: HeroProps) => {
  const handleStartClick = onStartChat || onGetStarted || (() => {});

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-emerald-50 overflow-hidden px-4">
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
      
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 relative z-10 max-w-5xl">
        <div className="text-center">
          {/* Professional Authority Section - Mais compacto */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-white/95 to-gray-50/95 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/30 shadow-2xl max-w-3xl mx-auto">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                {/* Professional Avatar - Menor */}
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Atom className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-800" />
                  </div>
                </div>
                
                {/* 5 Stars Rating - Menores */}
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Professional Title - Mais compacto */}
                <div className="text-center space-y-1 sm:space-y-2">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 leading-tight">
                    Treinado por Médicos e Especialistas
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-emerald-600 font-medium">
                    IA Especializada em Formulação Magistral
                  </p>
                </div>

                {/* Professional Credentials - Mais compacto */}
                <div className="bg-gray-100/80 rounded-lg px-3 py-2 sm:px-4 sm:py-2 border border-gray-200/60">
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <span>Validado Cientificamente</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <span>Expertise Médica</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>Tecnologia Avançada</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Title - Mais compacto */}
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 leading-tight px-2">
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                ANÁLISE DE FÓRMULAS MANIPULADAS
              </span>
            </h1>
          </div>

          {/* Problema/Solução Statement - Moved below the main title */}
          <div className="mb-3 sm:mb-4">
            <p className="text-lg sm:text-xl md:text-2xl text-yellow-600 font-bold mb-2 px-2 drop-shadow-lg">
              DIFICULDADE EM CRIAR E ANALISAR FÓRMULAS MANIPULADAS NUNCA MAIS
            </p>
          </div>

          {/* Subtitle - Mais compacto */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed px-2">
            IA TREINADA POR MÉDICO PARA AUXILIAR NO SEU DIA A DIA DO CONSULTÓRIO
          </p>

          {/* CTA Buttons - Destaque maior */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-2">
            <Button 
              size="lg" 
              onClick={handleStartClick}
              className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold rounded-xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-110 transition-all duration-300 border-2 border-emerald-400/50 w-full sm:w-auto max-w-xs sm:max-w-none pulse-glow"
            >
              <Zap className="mr-2 w-5 h-5 group-hover:animate-pulse" />
              COMEÇAR ANÁLISE AGORA
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-emerald-400 px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base rounded-xl backdrop-blur-sm hover:scale-105 transition-all duration-300 w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              <Beaker className="mr-2 w-4 h-4" />
              Ver Exemplos
            </Button>
          </div>

          {/* Features Grid - Mais compacto */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-2">
            {[
              {
                icon: FlaskConical,
                title: "Análise de Fórmulas",
                description: "Análise completa de composições"
              },
              {
                icon: Beaker,
                title: "Sugestão de Fórmulas", 
                description: "Formulações personalizadas"
              },
              {
                icon: CheckCircle,
                title: "Compatibilidade",
                description: "Verificação de interações"
              },
              {
                icon: Settings,
                title: "Otimização",
                description: "Melhore concentrações"
              }
            ].map((feature, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors leading-tight">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed px-1 hidden sm:block">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decoration - Menor */}
      <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-gradient-to-t from-gray-100 to-transparent"></div>
      
      {/* CSS para efeito pulse no botão */}
      <style>{`
        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(52, 211, 153, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(52, 211, 153, 0.6);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
