
import { supabase } from '@/integrations/supabase/client';

export const deleteDoctorInvitation = async (invitationId: string) => {
  console.log('🗑️ Excluindo convite:', invitationId);

  const { error } = await supabase
    .from('doctor_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) {
    console.error('❌ Erro ao excluir convite:', error);
    throw error;
  }

  console.log('✅ Convite excluído com sucesso');
};
