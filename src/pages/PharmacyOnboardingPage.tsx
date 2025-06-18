
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePharmacyOnboarding } from '@/hooks/usePharmacyOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import OnboardingSteps from '@/components/onboarding/OnboardingSteps';
import { Building, Check, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PharmacyOnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pharmacyData, setPharmacyData] = useState({
    name: '',
    slug: '',
    domain: '',
    contactEmail: '',
    phone: '',
    address: '',
    description: ''
  });
  const [selectedPlan, setSelectedPlan] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const { loading, checkSlugAvailability, completeOnboarding } = usePharmacyOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    'Informações da Farmácia',
    'Escolha do Plano',
    'Confirmação e Finalização'
  ];

  const plans = [
    {
      id: 'gratuito',
      name: 'Plano Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Ideal para começar',
      features: [
        'Até 50 consultas por dia',
        'Fórmulas básicas',
        'Suporte por email',
        'Dashboard básico'
      ],
      popular: false
    },
    {
      id: 'profissional',
      name: 'Plano Profissional',
      price: 'R$ 297',
      period: '/mês',
      description: 'Para farmácias em crescimento',
      features: [
        'Consultas ilimitadas',
        'Fórmulas avançadas + personalizadas',
        'Convite de médicos',
        'Relatórios detalhados',
        'Suporte prioritário',
        'Branding personalizado'
      ],
      popular: true
    }
  ];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  };

  const handleNameChange = (value: string) => {
    const newData = { ...pharmacyData, name: value };
    
    // Auto-gerar slug se ainda não foi modificado manualmente
    if (!pharmacyData.slug || pharmacyData.slug === generateSlug(pharmacyData.name)) {
      newData.slug = generateSlug(value);
      handleSlugChange(newData.slug, false);
    }
    
    setPharmacyData(newData);
  };

  const handleSlugChange = async (value: string, manual: boolean = true) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setPharmacyData(prev => ({ ...prev, slug }));
    
    if (slug.length >= 3) {
      setCheckingSlug(true);
      try {
        const available = await checkSlugAvailability(slug);
        setSlugAvailable(available);
      } catch (error) {
        console.error('Erro ao verificar slug:', error);
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    } else {
      setSlugAvailable(null);
    }
  };

  const validateStep1 = () => {
    if (!pharmacyData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da farmácia.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!pharmacyData.slug.trim()) {
      toast({
        title: "Nome no sistema obrigatório",
        description: "Por favor, defina um nome para o sistema.",
        variant: "destructive"
      });
      return false;
    }
    
    if (pharmacyData.slug.length < 3) {
      toast({
        title: "Nome muito curto",
        description: "O nome no sistema deve ter pelo menos 3 caracteres.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!pharmacyData.contactEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe um email de contato.",
        variant: "destructive"
      });
      return false;
    }
    
    if (slugAvailable === false) {
      toast({
        title: "Nome indisponível",
        description: "Este nome já está em uso. Escolha outro.",
        variant: "destructive"
      });
      return false;
    }
    
    if (slugAvailable === null && pharmacyData.slug.length >= 3) {
      toast({
        title: "Verificando disponibilidade",
        description: "Aguarde a verificação do nome ser concluída.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    
    if (currentStep === 2) {
      if (!selectedPlan) {
        toast({
          title: "Selecione um plano",
          description: "Escolha um plano para continuar.",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    const success = await completeOnboarding(pharmacyData, selectedPlan);
    if (!success) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao criar sua farmácia. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building className="w-8 h-8 text-emerald-500" />
              <h1 className="text-3xl font-bold">Cadastro da Farmácia</h1>
            </div>
            <p className="text-slate-300">Configure sua farmácia na plataforma</p>
          </div>

          {/* Steps */}
          <OnboardingSteps currentStep={currentStep} steps={steps} />

          {/* Step 1: Pharmacy Info */}
          {currentStep === 1 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informações da Farmácia</CardTitle>
                <CardDescription className="text-slate-300">
                  Conte-nos sobre sua farmácia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Nome da Farmácia *</Label>
                    <Input
                      id="name"
                      value={pharmacyData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Farmácia São João"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-white">Nome no Sistema *</Label>
                    <div className="relative">
                      <Input
                        id="slug"
                        value={pharmacyData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="ex: farmacia-sao-joao"
                        className="bg-slate-700 border-slate-600 text-white pr-10"
                      />
                      {checkingSlug && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        </div>
                      )}
                      {slugAvailable === true && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                      {slugAvailable === false && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {slugAvailable === false && (
                      <p className="text-red-400 text-sm">Este nome já está em uso</p>
                    )}
                    {slugAvailable === true && (
                      <p className="text-green-400 text-sm">Nome disponível!</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-white">Email de Contato *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={pharmacyData.contactEmail}
                      onChange={(e) => setPharmacyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contato@farmacia.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Telefone</Label>
                    <Input
                      id="phone"
                      value={pharmacyData.phone}
                      onChange={(e) => setPharmacyData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Endereço</Label>
                  <Input
                    id="address"
                    value={pharmacyData.address}
                    onChange={(e) => setPharmacyData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua das Flores, 123 - Centro"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Descrição</Label>
                  <Textarea
                    id="description"
                    value={pharmacyData.description}
                    onChange={(e) => setPharmacyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Conte um pouco sobre sua farmácia..."
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Plan Selection */}
          {currentStep === 2 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Escolha seu Plano</CardTitle>
                <CardDescription className="text-slate-300 text-center">
                  Selecione o plano que melhor atende suas necessidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      } ${plan.popular ? 'ring-2 ring-emerald-500' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500">
                          Mais Popular
                        </Badge>
                      )}
                      
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="mb-2">
                          <span className="text-3xl font-bold text-white">{plan.price}</span>
                          <span className="text-slate-400">{plan.period}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{plan.description}</p>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPlan === plan.id 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-slate-400'
                        }`}>
                          {selectedPlan === plan.id && (
                            <Check className="w-3 h-3 text-white transform translate-x-0.5 -translate-y-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Confirmação</CardTitle>
                <CardDescription className="text-slate-300 text-center">
                  Revise suas informações antes de finalizar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Informações da Farmácia</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-400">Nome:</span> <span className="text-white">{pharmacyData.name}</span></p>
                      <p><span className="text-slate-400">Sistema:</span> <span className="text-white">{pharmacyData.slug}</span></p>
                      <p><span className="text-slate-400">Email:</span> <span className="text-white">{pharmacyData.contactEmail}</span></p>
                      {pharmacyData.phone && (
                        <p><span className="text-slate-400">Telefone:</span> <span className="text-white">{pharmacyData.phone}</span></p>
                      )}
                      {pharmacyData.address && (
                        <p><span className="text-slate-400">Endereço:</span> <span className="text-white">{pharmacyData.address}</span></p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-3">Plano Selecionado</h4>
                    {selectedPlan && (
                      <div className="border border-slate-600 rounded-lg p-4">
                        {(() => {
                          const plan = plans.find(p => p.id === selectedPlan);
                          return plan ? (
                            <>
                              <h5 className="text-white font-medium">{plan.name}</h5>
                              <p className="text-slate-300 text-sm mb-2">{plan.description}</p>
                              <p className="text-emerald-400 font-bold">{plan.price}{plan.period}</p>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Próximos Passos</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Sua farmácia será criada no sistema</li>
                    <li>✓ Você se tornará o administrador principal</li>
                    <li>✓ Poderá convidar médicos para usar o sistema</li>
                    <li>✓ Acesso completo a fórmulas e relatórios</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Voltar ao Início' : 'Voltar'}
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={currentStep === 1 && checkingSlug}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {loading ? 'Criando Farmácia...' : 'Finalizar Cadastro'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyOnboardingPage;
