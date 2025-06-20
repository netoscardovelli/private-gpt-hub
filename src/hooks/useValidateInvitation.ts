
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
      
      // Query com acesso público usando o token
      const { data, error: queryError } = await supabase
        .from('doctor_invitations')
        .select(`
          *,
          organization:organizations(id, name, slug)
        `)
        .eq('invitation_token', token)
        .maybeSingle();

      console.log('📊 Resposta da query:', { data, error: queryError });

      if (queryError) {
        console.error('❌ Erro ao buscar convite:', queryError);
        throw new Error('Erro no banco de dados: ' + queryError.message);
      }

      if (!data) {
        throw new Error('Convite não encontrado. Verifique se o link está correto.');
      }

      console.log('📋 Dados do convite encontrado:', data);

      // Verificar se o convite ainda está pendente
      if (data.status !== 'pending') {
        if (data.status === 'accepted') {
          throw new Error('Este convite já foi aceito anteriormente.');
        } else if (data.status === 'expired') {
          throw new Error('Este convite expirou.');
        } else if (data.status === 'cancelled') {
          throw new Error('Este convite foi cancelado.');
        }
      }

      // Verificar se o convite expirou pela data
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        throw new Error('Este convite expirou em ' + expiresAt.toLocaleDateString('pt-BR'));
      }

      console.log('✅ Convite válido encontrado');
      
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
      console.error('❌ Erro na validação completa:', err);
      setError(err.message || 'Erro desconhecido ao validar convite');
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
