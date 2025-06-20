
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

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ['doctor-invitations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        console.log('⚠️ Usuário não tem organização');
        return [];
      }
      
      if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
        console.log('⚠️ Usuário não tem permissão:', profile?.role);
        return [];
      }

      const { data, error } = await supabase
        .from('doctor_invitations')
        .select(`
          *,
          profiles!invited_by(full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar convites:', error);
        throw new Error(`Erro ao carregar convites: ${error.message}`);
      }
      
      return data || [];
    },
    enabled: !!profile?.organization_id && ['admin', 'super_admin', 'owner'].includes(profile?.role || ''),
    retry: 1,
    refetchOnWindowFocus: false
  });

  const inviteDoctor = useMutation({
    mutationFn: async (email: string) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Usuário não está associado a uma organização ou não está autenticado');
      }

      if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
        throw new Error(`Usuário não tem permissão para convidar médicos. Role atual: ${profile?.role}`);
      }

      // Verificar se já existe convite pendente para este email
      const { data: existingInvite } = await supabase
        .from('doctor_invitations')
        .select('id, status')
        .eq('organization_id', profile.organization_id)
        .eq('email', email.toLowerCase())
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvite) {
        throw new Error('Já existe um convite pendente para este email');
      }

      const insertData = {
        organization_id: profile.organization_id,
        email: email.toLowerCase(),
        invited_by: profile.id
      };

      const { data, error } = await supabase
        .from('doctor_invitations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar convite:', error);
        throw new Error(error.message || 'Erro ao criar convite');
      }
      
      return data;
    },
    onSuccess: (data) => {
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
    error,
    inviteDoctor: inviteDoctor.mutate,
    cancelInvitation: cancelInvitation.mutate,
    resendInvitation: resendInvitation.mutate,
    isInviting: inviteDoctor.isPending,
    isCancelling: cancelInvitation.isPending,
    isResending: resendInvitation.isPending
  };
};
