
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import PricingSection from '@/components/PricingSection';

interface PharmacyData {
  name: string;
  slug: string;
  domain: string;
  description: string;
  address: string;
  phone: string;
  contactEmail: string;
}

const PharmacyOnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [pharmacyData, setPharmacyData] = useState<PharmacyData>({
    name: '',
    slug: '',
    domain: '',
    description: '',
    address: '',
    phone: '',
    contactEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleNameChange = (name: string) => {
    setPharmacyData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug) return false;
    
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar slug:', error);
      return false;
    }

    return !data;
  };

  const createOrganization = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    const isSlugAvailable = await checkSlugAvailability(pharmacyData.slug);
    if (!isSlugAvailable) {
      toast({
        title: "Slug indisponível",
        description: "Este nome já está em uso. Tente outro nome para sua farmácia.",
        variant: "destructive"
      });
      return null;
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .insert({
        name: pharmacyData.name,
        slug: pharmacyData.slug,
        domain: pharmacyData.domain,
        plan_type: selectedPlan.toLowerCase() === 'gratuito' ? 'free' : 'pro'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar organização:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar farmácia. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }

    return organization;
  };

  const setupInitialConfiguration = async (organizationId: string) => {
    // Criar configurações iniciais do sistema
    const { error: settingsError } = await supabase
      .from('system_settings')
      .insert({
        organization_id: organizationId,
        company_name: pharmacyData.name,
        primary_color: '#10b981',
        secondary_color: '#6366f1'
      });

    if (settingsError) {
      console.error('Erro ao criar configurações:', settingsError);
    }

    // Atualizar perfil do usuário para ser owner da organização
    await updateProfile({
      organization_id: organizationId,
      role: 'owner'
    });
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pharmacyData.name || !pharmacyData.contactEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome da farmácia e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!selectedPlan) {
      toast({
        title: "Selecione um plano",
        description: "Escolha um plano para continuar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const organization = await createOrganization();
      if (!organization) {
        setLoading(false);
        return;
      }

      await setupInitialConfiguration(organization.id);

      if (selectedPlan.toLowerCase() !== 'gratuito') {
        // Redirecionar para pagamento para planos pagos
        toast({
          title: "Farmácia criada!",
          description: "Redirecionando para o pagamento...",
        });
        // Aqui você integraria com Stripe
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast({
          title: "Farmácia criada com sucesso!",
          description: "Sua farmácia foi configurada e está pronta para uso.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Erro no onboarding:', error);
      toast({
        title: "Erro",
        description: "Falha no processo de cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar o cadastro de farmácias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold text-white">Cadastro de Farmácia</h1>
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Configure sua farmácia na plataforma em poucos passos simples
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-12 h-1 ${step > 1 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'
            }`}>
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
          </div>
        </div>

        {/* Step 1: Pharmacy Information */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações da Farmácia
                </CardTitle>
                <CardDescription>
                  Preencha os dados básicos da sua farmácia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStep1Submit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nome da Farmácia *</Label>
                      <Input
                        id="name"
                        value={pharmacyData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ex: Farmácia Central"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug" className="text-white">URL da Farmácia</Label>
                      <Input
                        id="slug"
                        value={pharmacyData.slug}
                        onChange={(e) => setPharmacyData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="farmacia-central"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Esta será sua URL: app.exemplo.com/{pharmacyData.slug}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail" className="text-white">Email de Contato *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={pharmacyData.contactEmail}
                        onChange={(e) => setPharmacyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="contato@farmacia.com"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
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

                  <div>
                    <Label htmlFor="domain" className="text-white">Domínio Personalizado (Opcional)</Label>
                    <Input
                      id="domain"
                      value={pharmacyData.domain}
                      onChange={(e) => setPharmacyData(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="www.farmacia.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-white">Endereço</Label>
                    <Textarea
                      id="address"
                      value={pharmacyData.address}
                      onChange={(e) => setPharmacyData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número, bairro, cidade, estado, CEP"
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Descrição</Label>
                    <Textarea
                      id="description"
                      value={pharmacyData.description}
                      onChange={(e) => setPharmacyData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descrição sobre sua farmácia e especialidades"
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Escolha seu Plano</h2>
              <p className="text-slate-300">
                Selecione o plano ideal para sua farmácia
              </p>
            </div>

            <PricingSection onSelectPlan={setSelectedPlan} />

            {selectedPlan && (
              <div className="max-w-md mx-auto mt-8">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-center">
                      Plano Selecionado: {selectedPlan}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleFinalSubmit}
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      {loading ? 'Configurando...' : 'Finalizar Cadastro'}
                      <CreditCard className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyOnboardingPage;
