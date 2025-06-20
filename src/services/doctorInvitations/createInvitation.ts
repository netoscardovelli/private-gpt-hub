
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
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar convite:', error);
    throw new Error(error.message || 'Erro ao criar convite');
  }
  
  console.log('✅ Convite criado com sucesso:', data);
  return data;
};
