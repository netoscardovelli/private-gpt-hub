
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PharmacyData {
  name: string;
  slug: string;
  domain?: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  description?: string;
}

export const usePharmacyOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    
    try {
      const { data, error } = await supabase.rpc('check_organization_slug_availability', {
        slug_to_check: slug
      });

      if (error) {
        console.error('Erro ao verificar slug:', error);
        return false;
      }

      return data; // true se disponível
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do slug:', error);
      return false;
    }
  };

  const createPharmacy = async (pharmacyData: PharmacyData, planType: string = 'free') => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);

    try {
      // Usar a função do banco para criar organização
      const { data: organizationId, error: orgError } = await supabase.rpc('create_organization_with_user', {
        org_name: pharmacyData.name,
        org_slug: pharmacyData.slug,
        org_contact_email: pharmacyData.contactEmail,
        org_phone: pharmacyData.phone || null,
        org_address: pharmacyData.address || null,
        org_description: pharmacyData.description || null,
        plan_type: planType
      });

      if (orgError) {
        console.error('Erro ao criar organização:', orgError);
        
        if (orgError.message.includes('Slug already taken')) {
          toast({
            title: "Nome indisponível",
            description: "Este nome de farmácia já está em uso. Tente outro.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao criar farmácia",
            description: "Falha ao criar organização. Tente novamente.",
            variant: "destructive"
          });
        }
        
        setLoading(false);
        return null;
      }

      // Buscar os dados da organização criada
      const { data: organization, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar organização:', fetchError);
        setLoading(false);
        return null;
      }

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
        console.error('Erro ao criar configurações iniciais:', settingsError);
        // Não falha o processo, apenas loga o erro
      }

      toast({
        title: "Farmácia criada com sucesso!",
        description: `${organization.name} foi configurada e está pronta para uso.`,
      });

      setLoading(false);
      return organization;

    } catch (error) {
      console.error('Erro no processo de criação:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha no processo de cadastro. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
      return null;
    }
  };

  const completeOnboarding = async (pharmacyData: PharmacyData, selectedPlan: string) => {
    const planType = selectedPlan === 'profissional' ? 'pro' : 'free';
    const organization = await createPharmacy(pharmacyData, planType);

    if (organization) {
      if (planType === 'pro') {
        // Para planos pagos, por enquanto apenas mostra mensagem
        toast({
          title: "Plano Profissional Selecionado",
          description: "Sua farmácia foi criada! Integração de pagamento será implementada em breve.",
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        // Para plano gratuito, redirecionar direto para o dashboard
        navigate('/');
      }
      return true;
    }

    return false;
  };

  return {
    loading,
    checkSlugAvailability,
    createPharmacy,
    completeOnboarding
  };
};
