
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

export const createDoctorInvitation = async (email: string, organizationId: string, invitedBy: string) => {
  console.log('📧 Enviando convite para:', email);

  // Verificar se já existe convite pendente para este email
  const { data: existingInvite } = await supabase
    .from('doctor_invitations')
    .select('id, status')
    .eq('organization_id', organizationId)
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInvite) {
    throw new Error('Já existe um convite pendente para este email');
  }

  const insertData = {
    organization_id: organizationId,
    email: email.toLowerCase(),
    invited_by: invitedBy
  };

  console.log('📝 Dados do convite:', insertData);

  const { data, error } = await supabase
    .from('doctor_invitations')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar convite:', error);
    throw new Error(error.message || 'Erro ao criar convite');
  }
  
  console.log('✅ Convite criado com sucesso:', data);
  return data;
};

export const cancelDoctorInvitation = async (invitationId: string) => {
  const { error } = await supabase
    .from('doctor_invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId);

  if (error) throw error;
};

export const resendDoctorInvitation = async (invitationId: string) => {
  const { error } = await supabase
    .from('doctor_invitations')
    .update({ 
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    })
    .eq('id', invitationId);

  if (error) throw error;
};
