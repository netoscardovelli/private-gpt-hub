
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Zap, Star } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

const PricingSection = ({ onSelectPlan }: PricingSectionProps) => {
  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      icon: Zap,
      features: [
        '10 mensagens por dia',
        'Acesso ao GPT-3.5',
        'Histórico de 7 dias',
        'Suporte por email'
      ],
      buttonText: 'Começar Grátis',
      variant: 'outline' as const,
      popular: false
    },
    {
      name: 'Pro',
      price: 'R$ 29',
      period: '/mês',
      description: 'Para profissionais produtivos',
      icon: Star,
      features: [
        '500 mensagens por dia',
        'Acesso ao GPT-4',
        'Histórico ilimitado',
        'Suporte prioritário',
        'Exportar conversas',
        'Modelos personalizados'
      ],
      buttonText: 'Assinar Pro',
      variant: 'default' as const,
      popular: true
    },
    {
      name: 'Premium',
      price: 'R$ 99',
      period: '/mês',
      description: 'Para equipes e empresas',
      icon: Crown,
      features: [
        'Mensagens ilimitadas',
        'Acesso ao GPT-4 Turbo',
        'Histórico ilimitado',
        'Suporte 24/7',
        'API personalizada',
        'Integrações avançadas',
        'Dashboard analytics',
        'White-label disponível'
      ],
      buttonText: 'Assinar Premium',
      variant: 'default' as const,
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Escolha Seu Plano
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Desbloqueie todo o potencial da IA com nossos planos flexíveis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index} 
                className={`relative bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="text-slate-300 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-slate-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full py-6 text-lg font-semibold rounded-xl transition-all duration-200 ${
                      plan.variant === 'default' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                    variant={plan.variant}
                    onClick={() => onSelectPlan(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400">
            Todos os planos incluem garantia de 30 dias. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
