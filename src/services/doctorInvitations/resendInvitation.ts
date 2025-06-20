
import { supabase } from '@/integrations/supabase/client';

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
