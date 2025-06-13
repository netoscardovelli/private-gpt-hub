
import { Button } from '@/components/ui/button';
import { ArrowRight, FlaskConical, Shield, Sparkles, Beaker, CheckCircle, Settings, Star, Zap, Atom } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-20 w-3 h-3 bg-green-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-emerald-300 rounded-full animate-bounce opacity-80" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-60 right-32 w-1 h-1 bg-green-300 rounded-full animate-bounce opacity-90" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-emerald-500 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-500 rounded-full animate-bounce opacity-40" style={{ animationDelay: '2.5s' }}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-16 right-16 w-16 h-16 border-2 border-emerald-400/30 rotate-45 animate-spin opacity-20" style={{ animationDuration: '20s' }}></div>
        <div className="absolute bottom-20 left-16 w-12 h-12 border-2 border-green-400/30 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-gradient-to-r from-emerald-400/20 to-green-400/20 transform rotate-12 animate-pulse"></div>
        
        {/* Molecular structure illustration */}
        <div className="absolute top-24 left-1/3 opacity-10">
          <div className="relative w-32 h-32">
            <div className="absolute top-0 left-1/2 w-4 h-4 bg-emerald-400 rounded-full transform -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-300 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* Connecting lines */}
            <div className="absolute top-2 left-1/2 w-px h-16 bg-emerald-300 transform -translate-x-1/2 rotate-45"></div>
            <div className="absolute top-2 left-1/2 w-px h-16 bg-emerald-300 transform -translate-x-1/2 -rotate-45"></div>
          </div>
        </div>
        
        {/* DNA helix pattern */}
        <div className="absolute bottom-32 right-1/4 opacity-10">
          <div className="relative w-24 h-40">
            <div className="absolute left-0 top-0 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="absolute right-0 top-4 w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute left-0 top-8 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute right-0 top-12 w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute left-0 top-16 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
            <div className="absolute right-0 top-20 w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='45' cy='45' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Enhanced Dr. Neto Section with visual elements */}
          <div className="mb-10 p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm animate-scale-in">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-xl text-emerald-300 font-bold">
                  Treinado pelo Dr. Neto Scardovelli
                </p>
                <p className="text-sm text-slate-400">Especialista em Fórmulas Magistrais</p>
              </div>
            </div>
            <div className="flex justify-center items-center space-x-6">
              <span className="text-slate-400">Siga-me:</span>
              <a 
                href="https://instagram.com/netoscardovelli" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold hover:scale-105 transform duration-200"
              >
                @netoscardovelli
              </a>
            </div>
          </div>

          {/* Enhanced Main Heading with decorative elements */}
          <div className="relative mb-8">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <Atom className="w-12 h-12 text-emerald-400/30 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
                ANÁLISE DE FÓRMULAS MAGISTRAIS
              </span>
            </h1>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
          </div>

          {/* Enhanced Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            IA TREINADA POR MÉDICO PARA AUXILIAR NO SEU DIA A DIA DO CONSULTÓRIO
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-10 py-5 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 border border-emerald-400/30"
            >
              <Zap className="mr-3 w-5 h-5 group-hover:animate-pulse" />
              Começar Análise
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-slate-400 text-slate-300 hover:bg-slate-800 hover:border-emerald-400 px-10 py-5 text-lg rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              <Beaker className="mr-2 w-5 h-5" />
              Ver Exemplos
            </Button>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: FlaskConical,
                title: "Análise de Fórmulas Magistrais",
                description: "Análise completa de composições e sinergias entre ativos",
                delay: "0s"
              },
              {
                icon: Beaker,
                title: "Sugestões de Fórmulas Magistrais", 
                description: "Formulações personalizadas baseadas em evidências científicas",
                delay: "0.1s"
              },
              {
                icon: CheckCircle,
                title: "Compatibilidade",
                description: "Verificação de interações entre ativos e excipientes", 
                delay: "0.2s"
              },
              {
                icon: Settings,
                title: "Otimização",
                description: "Melhore concentrações e formas farmacêuticas",
                delay: "0.3s"
              }
            ].map((feature, index) => (
              <div key={index} className="group text-center animate-fade-in" style={{ animationDelay: feature.delay }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-emerald-500/25">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  {/* Decorative ring */}
                  <div className="absolute -top-2 -left-2 w-20 h-20 border-2 border-emerald-400/20 rounded-2xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-800 to-transparent"></div>
    </section>
  );
};

export default Hero;
