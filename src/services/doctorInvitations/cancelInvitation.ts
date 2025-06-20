
import { supabase } from '@/integrations/supabase/client';

export const cancelDoctorInvitation = async (invitationId: string) => {
  const { error } = await supabase
    .from('doctor_invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId);

  if (error) throw error;
};
