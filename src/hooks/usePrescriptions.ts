
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchPrescriptionsApi,
  fetchPrescriptionByIdApi,
  createPrescriptionApi,
  updatePrescriptionStatusApi,
  fetchPrescriptionItemsApi,
  fetchPrescriptionTemplatesApi,
  createPrescriptionTemplateApi,
  fetchDispensationLogsApi,
  createDispensationLogApi,
  fetchDigitalSignaturesApi,
  createDigitalSignatureApi,
  validateCpfApi
} from '@/services/prescriptionsService';
import type { 
  CreatePrescriptionData, 
  PrescriptionTemplate, 
  DispensationLog, 
  DigitalSignature 
} from '@/types/prescriptions';

export const usePrescriptions = (doctorId?: string) => {
  return useQuery({
    queryKey: ['prescriptions', doctorId],
    queryFn: () => fetchPrescriptionsApi(doctorId),
  });
};

export const usePrescription = (id: string) => {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => fetchPrescriptionByIdApi(id),
    enabled: !!id,
  });
};

export const usePrescriptionItems = (prescriptionId: string) => {
  return useQuery({
    queryKey: ['prescription-items', prescriptionId],
    queryFn: () => fetchPrescriptionItemsApi(prescriptionId),
    enabled: !!prescriptionId,
  });
};

export const usePrescriptionTemplates = (doctorId?: string) => {
  return useQuery({
    queryKey: ['prescription-templates', doctorId],
    queryFn: () => fetchPrescriptionTemplatesApi(doctorId),
  });
};

export const useDispensationLogs = (prescriptionId: string) => {
  return useQuery({
    queryKey: ['dispensation-logs', prescriptionId],
    queryFn: () => fetchDispensationLogsApi(prescriptionId),
    enabled: !!prescriptionId,
  });
};

export const useDigitalSignatures = (prescriptionId: string) => {
  return useQuery({
    queryKey: ['digital-signatures', prescriptionId],
    queryFn: () => fetchDigitalSignaturesApi(prescriptionId),
    enabled: !!prescriptionId,
  });
};

export const useCreatePrescription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrescriptionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Prescrição criada!",
        description: "A prescrição digital foi gerada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar prescrição",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdatePrescriptionStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      updatePrescriptionStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription'] });
      toast({
        title: "Status atualizado!",
        description: "O status da prescrição foi alterado."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useCreatePrescriptionTemplate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrescriptionTemplateApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-templates'] });
      toast({
        title: "Template criado!",
        description: "Template de prescrição salvo com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar template",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useCreateDispensationLog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDispensationLogApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispensation-logs'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Dispensação registrada!",
        description: "O medicamento foi dispensado e registrado."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar dispensação",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useCreateDigitalSignature = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDigitalSignatureApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Prescrição assinada!",
        description: "A assinatura digital foi aplicada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao assinar prescrição",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useValidateCpf = () => {
  return useMutation({
    mutationFn: validateCpfApi,
  });
};
