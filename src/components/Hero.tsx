
import { Button } from '@/components/ui/button';
import { ArrowRight, FlaskConical, Shield, Sparkles, Beaker, CheckCircle, Settings } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge with Dr. Info */}
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-4">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">Powered by OpenAI GPT-4</span>
          </div>

          {/* Dr. Neto Scardovelli Credit */}
          <div className="mb-8">
            <p className="text-lg text-emerald-300 font-semibold mb-2">
              Treinado pelo Dr. Neto Scardovelli
            </p>
            <div className="flex justify-center items-center space-x-4">
              <span className="text-slate-400">Siga-me:</span>
              <a 
                href="https://instagram.com/netoscardovelli" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                @netoscardovelli
              </a>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Análise de
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent"> Fórmulas</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Assistente IA especializado em análise de fórmulas de manipulação farmacêutica. 
            Analise compatibilidade, calcule concentrações e otimize suas formulações com segurança.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              Começar Análise
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-400 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg rounded-xl"
            >
              Ver Exemplos
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Análise de Fórmulas Magistrais</h3>
              <p className="text-slate-400">Análise completa de composições e sinergias entre ativos</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Sugestões de Fórmulas Magistrais</h3>
              <p className="text-slate-400">Formulações personalizadas baseadas em evidências científicas</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Compatibilidade</h3>
              <p className="text-slate-400">Verificação de interações entre ativos e excipientes</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Otimização</h3>
              <p className="text-slate-400">Melhore concentrações e formas farmacêuticas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
