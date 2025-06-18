
import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DoctorInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token: string;
  expires_at: string;
  created_at: string;
  invited_by: string;
}

export const useDoctorInvitations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['doctor-invitations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('doctor_invitations')
        .select(`
          *,
          profiles!invited_by(full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id && ['admin', 'super_admin', 'owner'].includes(profile?.role || '')
  });

  const inviteDoctor = useMutation({
    mutationFn: async (email: string) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organização ou usuário não encontrado');
      }

      const { data, error } = await supabase
        .from('doctor_invitations')
        .insert({
          organization_id: profile.organization_id,
          email: email.toLowerCase(),
          invited_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite enviado!",
        description: "O médico receberá um email com instruções para se cadastrar."
      });
    },
    onError: (error: any) => {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Tente novamente em alguns minutos",
        variant: "destructive"
      });
    }
  });

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('doctor_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso."
      });
    },
    onError: (error: any) => {
      console.error('Erro ao cancelar convite:', error);
      toast({
        title: "Erro ao cancelar convite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('doctor_invitations')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite reenviado!",
        description: "O convite foi renovado e é válido por mais 7 dias."
      });
    },
    onError: (error: any) => {
      console.error('Erro ao reenviar convite:', error);
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    invitations,
    isLoading,
    inviteDoctor: inviteDoctor.mutate,
    cancelInvitation: cancelInvitation.mutate,
    resendInvitation: resendInvitation.mutate,
    isInviting: inviteDoctor.isPending,
    isCancelling: cancelInvitation.isPending,
    isResending: resendInvitation.isPending
  };
};
