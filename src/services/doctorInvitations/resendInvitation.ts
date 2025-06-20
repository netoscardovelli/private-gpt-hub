
import { supabase } from '@/integrations/supabase/client';

export const resendDoctorInvitation = async (invitationId: string) => {
  console.log('🔄 Reenviando convite:', invitationId);

  // Primeiro, renovar o convite no banco
  const { data, error } = await supabase
    .from('doctor_invitations')
    .update({ 
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    })
    .eq('id', invitationId)
    .select(`
      *,
      organization:organizations(name, slug)
    `)
    .single();

  if (error) {
    console.error('❌ Erro ao renovar convite:', error);
    throw error;
  }

  console.log('✅ Convite renovado:', data);

  // Reenviar email automaticamente
  try {
    console.log('📤 Reenviando email...');
    
    // Usar nome dinâmico da farmácia
    const organizationName = data.organization?.name || 'Farmácia';
    const invitedByName = `Equipe da ${organizationName}`;
    
    const emailPayload = {
      invitationId: data.id,
      email: data.email,
      organizationName: organizationName,
      invitedByName: invitedByName,
      expiresAt: data.expires_at
    };

    console.log('📨 Payload do reenvio:', emailPayload);

    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-doctor-invitation', {
      body: emailPayload
    });

    if (emailError) {
      console.error('⚠️ Erro ao reenviar email (convite foi renovado):', emailError);
      // Não vamos falhar a operação se o email falhar
    } else {
      console.log('✅ Email reenviado com sucesso:', emailResult);
    }

  } catch (emailError) {
    console.error('⚠️ Erro ao disparar reenvio de email (convite foi renovado):', emailError);
  }

  return data;
};
