
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

  // Debug logs para verificar permissões
  console.log('🔍 Debug - useDoctorInvitations:', {
    profileId: profile?.id,
    organizationId: profile?.organization_id,
    role: profile?.role
  });

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ['doctor-invitations', profile?.organization_id],
    queryFn: async () => {
      console.log('🔍 Buscando convites...');
      
      if (!profile?.organization_id) {
        console.log('❌ Usuário não tem organização');
        return [];
      }
      
      if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
        console.log('❌ Usuário não tem permissão:', profile?.role);
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

      console.log('🔍 Resultado da busca:', { data, error });

      if (error) {
        console.error('❌ Erro ao buscar convites:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profile?.organization_id && ['admin', 'super_admin', 'owner'].includes(profile?.role || '')
  });

  const inviteDoctor = useMutation({
    mutationFn: async (email: string) => {
      console.log('🔍 Tentando convidar médico:', {
        email,
        profileId: profile?.id,
        organizationId: profile?.organization_id,
        role: profile?.role
      });

      if (!profile?.organization_id || !profile?.id) {
        const error = new Error('Usuário não está associado a uma organização ou não está autenticado');
        console.error('❌', error.message);
        throw error;
      }

      if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
        const error = new Error(`Usuário não tem permissão para convidar médicos. Role atual: ${profile?.role}`);
        console.error('❌', error.message);
        throw error;
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
        const error = new Error('Já existe um convite pendente para este email');
        console.error('❌', error.message);
        throw error;
      }

      const insertData = {
        organization_id: profile.organization_id,
        email: email.toLowerCase(),
        invited_by: profile.id
      };

      console.log('🔍 Dados para inserção:', insertData);

      const { data, error } = await supabase
        .from('doctor_invitations')
        .insert(insertData)
        .select()
        .single();

      console.log('🔍 Resultado da inserção:', { data, error });

      if (error) {
        console.error('❌ Erro detalhado na inserção:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Convite criado com sucesso:', data);
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
      console.log('🔍 Cancelando convite:', invitationId);
      
      const { error } = await supabase
        .from('doctor_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) {
        console.error('❌ Erro ao cancelar convite:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('✅ Convite cancelado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso."
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao cancelar convite:', error);
      toast({
        title: "Erro ao cancelar convite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('🔍 Reenviando convite:', invitationId);
      
      const { error } = await supabase
        .from('doctor_invitations')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId);

      if (error) {
        console.error('❌ Erro ao reenviar convite:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('✅ Convite reenviado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['doctor-invitations'] });
      toast({
        title: "Convite reenviado!",
        description: "O convite foi renovado e é válido por mais 7 dias."
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao reenviar convite:', error);
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Log de erro de carregamento
  if (error) {
    console.error('❌ Erro ao carregar convites:', error);
  }

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
