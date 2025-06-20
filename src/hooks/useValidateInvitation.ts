
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DoctorInvitation } from '@/types/doctorInvitations';

interface ValidationResponse {
  invitation: DoctorInvitation | null;
  isLoading: boolean;
  error: string | null;
  validateInvitation: (token: string) => Promise<void>;
}

export const useValidateInvitation = (): ValidationResponse => {
  const [invitation, setInvitation] = useState<DoctorInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInvitation = async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Validando convite com token:', token);
      
      const { data, error: queryError } = await supabase
        .from('doctor_invitations')
        .select(`
          *,
          organization:organizations(id, name, slug)
        `)
        .eq('invitation_token', token)
        .single();

      if (queryError) {
        console.error('❌ Erro ao buscar convite:', queryError);
        throw new Error('Convite não encontrado');
      }

      if (!data) {
        throw new Error('Convite não encontrado');
      }

      // Verificar se o convite expirou
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        throw new Error('Este convite expirou');
      }

      // Verificar se o convite foi cancelado
      if (data.status === 'cancelled') {
        throw new Error('Este convite foi cancelado');
      }

      console.log('✅ Convite válido encontrado:', data);
      
      // Transformar os dados para o tipo correto
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
          id: data.organization.id || data.organization_id,
          name: data.organization.name,
          slug: data.organization.slug
        } : undefined
      };
      
      setInvitation(transformedInvitation);
    } catch (err: any) {
      console.error('❌ Erro na validação:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    invitation,
    isLoading,
    error,
    validateInvitation
  };
};
