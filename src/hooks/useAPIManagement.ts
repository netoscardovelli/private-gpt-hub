
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchAPIPartnersApi,
  createAPIPartnerApi,
  updateAPIPartnerApi,
  deleteAPIPartnerApi,
  fetchAPIUsageApi,
  fetchAPICacheApi,
  clearExpiredCacheApi,
  fetchIntegrationConfigsApi,
  createIntegrationConfigApi,
  updateIntegrationConfigApi
} from '@/services/apiManagementService';
import type { APIPartner, IntegrationConfig } from '@/types/api';

export const useAPIPartners = () => {
  return useQuery({
    queryKey: ['api-partners'],
    queryFn: fetchAPIPartnersApi,
  });
};

export const useAPIUsage = (partnerId?: string) => {
  return useQuery({
    queryKey: ['api-usage', partnerId],
    queryFn: () => fetchAPIUsageApi(partnerId),
  });
};

export const useAPICache = () => {
  return useQuery({
    queryKey: ['api-cache'],
    queryFn: fetchAPICacheApi,
  });
};

export const useIntegrationConfigs = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['integration-configs', profile?.organization_id],
    queryFn: () => fetchIntegrationConfigsApi(profile?.organization_id || ''),
    enabled: !!profile?.organization_id,
  });
};

export const useCreateAPIPartner = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAPIPartnerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-partners'] });
      toast({
        title: "Parceiro criado!",
        description: "Novo parceiro de API foi adicionado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar parceiro",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateAPIPartner = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<APIPartner> }) =>
      updateAPIPartnerApi(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-partners'] });
      toast({
        title: "Parceiro atualizado!",
        description: "Informações do parceiro foram atualizadas."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar parceiro",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteAPIPartner = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAPIPartnerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-partners'] });
      toast({
        title: "Parceiro removido!",
        description: "Parceiro de API foi removido com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover parceiro",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useClearExpiredCache = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearExpiredCacheApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-cache'] });
      toast({
        title: "Cache limpo!",
        description: "Cache expirado foi removido com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao limpar cache",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useCreateIntegrationConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIntegrationConfigApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] });
      toast({
        title: "Integração configurada!",
        description: "Nova configuração de integração foi criada."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao configurar integração",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
