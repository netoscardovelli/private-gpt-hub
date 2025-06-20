
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationData {
  token: string;
  fullName: string;
  email: string;
  password: string;
  crm: string;
  specialty: string;
}

interface RegistrationResponse {
  registerDoctor: (data: RegistrationData) => Promise<void>;
  isRegistering: boolean;
}

export const useDoctorRegistration = (): RegistrationResponse => {
  const [isRegistering, setIsRegistering] = useState(false);

  const registerDoctor = async (data: RegistrationData) => {
    setIsRegistering(true);
    
    try {
      console.log('👨‍⚕️ Iniciando registro do médico:', data.email);
      
      // 1. Primeiro, validar se o convite ainda é válido
      const { data: invitation, error: inviteError } = await supabase
        .from('doctor_invitations')
        .select('*, organization:organizations(id, name)')
        .eq('invitation_token', data.token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        throw new Error('Convite inválido ou expirado');
      }

      // 2. Verificar se o email do convite confere
      if (invitation.email !== data.email) {
        throw new Error('Email não confere com o convite');
      }

      // 3. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            crm: data.crm,
            specialty: data.specialty,
            organization_id: invitation.organization_id,
            role: 'doctor'
          }
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      console.log('✅ Usuário criado:', authData.user.id);

      // 4. Atualizar convite para aceito
      const { error: updateError } = await supabase
        .from('doctor_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar convite:', updateError);
        // Não falhar aqui, pois o usuário já foi criado
      }

      // 5. Criar perfil do médico (se necessário)
      const { error: profileError } = await supabase
        .from('doctor_profiles')
        .insert({
          user_id: authData.user.id,
          specialty: data.specialty,
          organization_id: invitation.organization_id,
          experience_level: 'Iniciante',
          focus_area: 'Clínica Geral'
        });

      if (profileError) {
        console.error('⚠️ Erro ao criar perfil do médico:', profileError);
        // Não falhar aqui, pois o usuário já foi criado
      }

      console.log('✅ Registro do médico concluído com sucesso');
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    registerDoctor,
    isRegistering
  };
};
