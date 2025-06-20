
import { supabase } from '@/integrations/supabase/client';

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
    .select(`
      *,
      organization:organizations(name, slug)
    `)
    .single();

  if (error) {
    console.error('❌ Erro ao criar convite:', error);
    throw new Error(error.message || 'Erro ao criar convite');
  }
  
  console.log('✅ Convite criado com sucesso:', data);

  // Enviar email automaticamente
  try {
    console.log('📤 Disparando envio de email...');
    
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

    console.log('📨 Payload do email:', emailPayload);

    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-doctor-invitation', {
      body: emailPayload
    });

    if (emailError) {
      console.error('⚠️ Erro ao enviar email (convite foi salvo):', emailError);
      // Não vamos falhar a operação inteira se o email falhar
      // O convite foi criado com sucesso, só o email que falhou
    } else {
      console.log('✅ Email enviado com sucesso:', emailResult);
    }

  } catch (emailError) {
    console.error('⚠️ Erro ao disparar envio de email (convite foi salvo):', emailError);
    // Mesmo comportamento: não falhar a operação principal
  }

  return data;
};
