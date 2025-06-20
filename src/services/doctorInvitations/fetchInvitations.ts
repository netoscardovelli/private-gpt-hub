
import { supabase } from '@/integrations/supabase/client';
import { DoctorInvitation } from '@/types/doctorInvitations';

export const fetchDoctorInvitations = async (organizationId: string): Promise<DoctorInvitation[]> => {
  console.log('🔍 Buscando convites para organização:', organizationId);

  // Buscar apenas os convites básicos primeiro
  const { data: invitationsData, error: invitationsError } = await supabase
    .from('doctor_invitations')
    .select('id, email, status, invitation_token, expires_at, created_at, invited_by, organization_id')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (invitationsError) {
    console.error('❌ Erro ao buscar convites:', invitationsError);
    throw new Error(`Erro ao carregar convites: ${invitationsError.message}`);
  }

  console.log('✅ Convites encontrados:', invitationsData?.length || 0);

  if (!invitationsData || invitationsData.length === 0) {
    return [];
  }

  // Para cada convite, tentar buscar o nome do usuário que convidou
  const invitationsWithNames = await Promise.all(
    invitationsData.map(async (invitation) => {
      try {
        const { data: inviterProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', invitation.invited_by)
          .single();
        
        return {
          ...invitation,
          invited_by_name: inviterProfile?.full_name || 'Usuário não encontrado'
        };
      } catch (error) {
        console.warn('⚠️ Não foi possível buscar nome do usuário:', invitation.invited_by);
        return {
          ...invitation,
          invited_by_name: 'Usuário não encontrado'
        };
      }
    })
  );

  return invitationsWithNames as DoctorInvitation[];
};
