
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DoctorInvitation } from '@/types/doctorInvitations';

interface ValidationResponse {
  invitation: DoctorInvitation | null;
  isLoading: boolean;
  error: string | null;
  validateInvitation: (token: string) => Promise<void>;
  retry: () => Promise<void>;
}

export const useValidateInvitation = (): ValidationResponse => {
  const [invitation, setInvitation] = useState<DoctorInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);

  const validateInvitation = async (token: string) => {
    setIsLoading(true);
    setError(null);
    setLastToken(token);
    
    try {
      console.log('🔍 Validando convite com token:', token);
      
      // Buscar convite sem autenticação - agora funciona com RLS público
      const { data, error: queryError } = await supabase
        .from('doctor_invitations')
        .select(`
          *,
          organization:organizations(id, name, slug)
        `)
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .maybeSingle();

      if (queryError) {
        console.error('❌ Erro ao buscar convite:', queryError);
        throw new Error('Erro ao validar convite. Tente novamente.');
      }

      if (!data) {
        console.log('❌ Convite não encontrado ou não está pendente');
        throw new Error('Convite não encontrado, já foi usado ou expirou.');
      }

      console.log('📋 Convite encontrado:', data);

      // Verificar se o convite expirou
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        console.log('⏰ Convite expirado:', { now, expiresAt });
        throw new Error(`Este convite expirou em ${expiresAt.toLocaleDateString('pt-BR')}.`);
      }

      console.log('✅ Convite válido');
      
      const transformedInvitation: DoctorInvitation = {
        id: data.id,
        email: data.email,
        status: data.status as 'pending' | 'accepted' | 'expired' | 'cancelled',
        invitation_token: data.invitation_token,
        expires_at: data.expires_at,
        created_at: data.created_at,
        accepted_at: data.accepted_at,
        invited_by: data.invited_by,
        organization_id: data.organization_id,
        updated_at: data.updated_at,
        organization: data.organization ? {
          id: data.organization.id,
          name: data.organization.name,
          slug: data.organization.slug
        } : undefined
      };
      
      setInvitation(transformedInvitation);
    } catch (err: any) {
      console.error('❌ Erro na validação:', err);
      setError(err.message || 'Erro desconhecido ao validar convite');
      setInvitation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const retry = async () => {
    if (lastToken) {
      await validateInvitation(lastToken);
    }
  };

  return {
    invitation,
    isLoading,
    error,
    validateInvitation,
    retry
  };
};
