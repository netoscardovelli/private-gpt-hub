import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { createDoctorInvitation, cancelDoctorInvitation, resendDoctorInvitation, deleteDoctorInvitation } from '@/services/doctorInvitations';

export const useDoctorInvitationMutations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inviteDoctor = useMutation({
    mutationFn: async (email: string) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Usuário não está associado a uma organização ou não está autenticado');
      }

      if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
        throw new Error(`Você não tem permissão para convidar médicos. Role atual: ${profile?.role}`);
      }

      return createDoctorInvitation(email, profile.organization_id, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite enviado!",
        description: "O médico receberá um email com instruções para se cadastrar."
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao enviar convite:', error);
      
      let errorMessage = "Erro desconhecido. Tente novamente em alguns minutos.";
      
      if (error.message.includes('já existe um convite pendente')) {
        errorMessage = "Já existe um convite pendente para este email.";
      } else if (error.message.includes('não tem permissão')) {
        errorMessage = "Você não tem permissão para convidar médicos.";
      } else if (error.message.includes('não está associado')) {
        errorMessage = "Sua conta não está associada a uma organização.";
      } else if (error.code === '23505') {
        errorMessage = "Este email já foi convidado para esta organização.";
      } else if (error.code === '42501') {
        errorMessage = "Permissão negada. Verifique se você tem role de administrador.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao enviar convite",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const cancelInvitation = useMutation({
    mutationFn: cancelDoctorInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar convite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resendInvitation = useMutation({
    mutationFn: resendDoctorInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite reenviado!",
        description: "O convite foi renovado e é válido por mais 7 dias."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteInvitation = useMutation({
    mutationFn: deleteDoctorInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite excluído",
        description: "O convite foi excluído permanentemente."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir convite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    inviteDoctor: inviteDoctor.mutate,
    cancelInvitation: cancelInvitation.mutate,
    resendInvitation: resendInvitation.mutate,
    deleteInvitation: deleteInvitation.mutate,
    isInviting: inviteDoctor.isPending,
    isCancelling: cancelInvitation.isPending,
    isResending: resendInvitation.isPending,
    isDeleting: deleteInvitation.isPending
  };
};
