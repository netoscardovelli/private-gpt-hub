
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
      
      // 1. Validar convite novamente antes de criar usuário
      const { data: invitation, error: inviteError } = await supabase
        .from('doctor_invitations')
        .select('*, organization:organizations(id, name)')
        .eq('invitation_token', data.token)
        .eq('status', 'pending')
        .maybeSingle();

      if (inviteError) {
        console.error('❌ Erro ao validar convite:', inviteError);
        throw new Error('Erro ao validar convite. Tente novamente.');
      }

      if (!invitation) {
        throw new Error('Convite inválido, expirado ou já foi usado.');
      }

      // 2. Verificar se o email confere
      if (invitation.email !== data.email) {
        throw new Error('Email não confere com o convite enviado.');
      }

      // 3. Verificar se convite não expirou
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      if (now > expiresAt) {
        throw new Error('Este convite expirou. Solicite um novo convite.');
      }

      console.log('✅ Convite válido, criando usuário...');

      // 4. Criar usuário no Supabase Auth
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
        
        if (authError.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login.');
        } else if (authError.message.includes('Password')) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        } else {
          throw new Error(authError.message || 'Erro ao criar conta');
        }
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário. Tente novamente.');
      }

      console.log('✅ Usuário criado:', authData.user.id);

      // 5. Marcar convite como aceito
      const { error: updateError } = await supabase
        .from('doctor_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar convite:', updateError);
        // Não falhar aqui, pois o usuário já foi criado
      }

      // 6. Criar perfil do médico
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
        // Não falhar aqui, o usuário já foi criado
      }

      console.log('✅ Registro concluído com sucesso!');
      
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
