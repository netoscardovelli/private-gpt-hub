
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
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar slug:', error);
        return false;
      }

      return !data; // true se não existe (disponível)
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
      // Verificar se o slug está disponível
      const isSlugAvailable = await checkSlugAvailability(pharmacyData.slug);
      if (!isSlugAvailable) {
        toast({
          title: "Nome indisponível",
          description: "Este nome de farmácia já está em uso. Tente outro.",
          variant: "destructive"
        });
        setLoading(false);
        return null;
      }

      console.log('🚀 Iniciando criação da organização...');
      console.log('📝 Dados da organização:', {
        name: pharmacyData.name,
        slug: pharmacyData.slug,
        plan_type: planType,
        contact_email: pharmacyData.contactEmail,
        phone: pharmacyData.phone || null,
        address: pharmacyData.address || null,
        description: pharmacyData.description || null
      });

      // Criar a organização com mais logs para debug
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: pharmacyData.name,
          slug: pharmacyData.slug,
          plan_type: planType,
          contact_email: pharmacyData.contactEmail,
          phone: pharmacyData.phone || null,
          address: pharmacyData.address || null,
          description: pharmacyData.description || null
        })
        .select()
        .single();

      if (orgError) {
        console.error('❌ Erro detalhado ao criar organização:', {
          error: orgError,
          code: orgError.code,
          message: orgError.message,
          details: orgError.details,
          hint: orgError.hint
        });
        
        toast({
          title: "Erro ao criar farmácia",
          description: `Falha ao criar organização: ${orgError.message}. Código: ${orgError.code}`,
          variant: "destructive"
        });
        setLoading(false);
        return null;
      }

      console.log('✅ Organização criada com sucesso:', organization);

      // Atualizar o perfil do usuário para ser owner da organização
      console.log('📝 Atualizando perfil do usuário...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          organization_id: organization.id, 
          role: 'owner' 
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        toast({
          title: "Erro ao atualizar perfil",
          description: `Falha ao atualizar perfil: ${profileError.message}`,
          variant: "destructive"
        });
        setLoading(false);
        return null;
      }

      console.log('✅ Perfil atualizado com sucesso');

      // Forçar atualização do perfil no contexto
      await updateProfile({ 
        organization_id: organization.id, 
        role: 'owner' 
      });

      // Criar configurações iniciais do sistema
      console.log('⚙️ Criando configurações do sistema...');
      const { error: settingsError } = await supabase
        .from('system_settings')
        .insert({
          organization_id: organization.id,
          company_name: pharmacyData.name,
          primary_color: '#10b981',
          secondary_color: '#6366f1'
        });

      if (settingsError) {
        console.error('⚠️ Erro ao criar configurações iniciais:', settingsError);
        // Não falha o processo, apenas loga o erro
      } else {
        console.log('✅ Configurações do sistema criadas');
      }

      toast({
        title: "Farmácia criada com sucesso!",
        description: `${organization.name} foi configurada e está pronta para uso.`,
      });

      setLoading(false);
      return organization;

    } catch (error) {
      console.error('💥 Erro inesperado no processo de criação:', error);
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
      toast({
        title: "Redirecionando...",
        description: "Aguarde enquanto carregamos seu dashboard.",
      });

      // Pequeno delay para garantir que o contexto seja atualizado
      setTimeout(() => {
        if (planType === 'pro') {
          toast({
            title: "Plano Profissional Selecionado",
            description: "Sua farmácia foi criada! Integração de pagamento será implementada em breve.",
          });
        }
        
        // Redirecionar para a página inicial que irá detectar a organização e redirecionar para o dashboard
        navigate('/');
      }, 1000);
      
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
