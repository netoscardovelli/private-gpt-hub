
import { supabase } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = 'https://graumqipaeijtrnldhpq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYXVtcWlwYWVpanRybmxkaHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDkzMzUsImV4cCI6MjA2NTQyNTMzNX0.pan6g_v-RKsu98BXjdlvDXWZsb3QnfMLyjLM1S5k_x8';

const supabaseClient = supabase(supabaseUrl, supabaseKey);

export const getDoctorProfile = async (userId: string) => {
  try {
    console.log('Buscando perfil do médico:', userId);
    
    const { data: profile, error } = await supabaseClient
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    // Se não existe perfil, criar um básico
    if (!profile) {
      console.log('Criando perfil básico para o médico');
      const { data: newProfile, error: createError } = await supabaseClient
        .from('doctor_profiles')
        .insert({
          user_id: userId,
          specialty: 'Medicina Geral',
          experience_level: 'Iniciante',
          focus_area: 'Clínica Geral'
        })
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar perfil:', createError);
        return null;
      }

      return newProfile;
    }

    return profile;
  } catch (error) {
    console.error('Erro geral ao buscar perfil:', error);
    return null;
  }
};

export const updateDoctorLearning = async (userId: string, learningData: any) => {
  try {
    console.log('Atualizando aprendizado do médico:', userId, learningData);
    
    const { data, error } = await supabaseClient
      .from('doctor_profiles')
      .update({
        preferred_actives: learningData.preferred_actives,
        concentration_preferences: learningData.concentration_preferences,
        formulation_style: learningData.formulation_style,
        focus_areas: learningData.focus_areas,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Erro ao atualizar aprendizado:', error);
      return false;
    }

    console.log('Aprendizado atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro geral ao atualizar aprendizado:', error);
    return false;
  }
};

export const saveFeedback = async (userId: string, originalAnalysis: string, feedback: string, rating: number) => {
  try {
    console.log('Salvando feedback:', userId);
    
    const { data, error } = await supabaseClient
      .from('analysis_feedback')
      .insert({
        user_id: userId,
        original_analysis: originalAnalysis,
        feedback: feedback,
        rating: rating,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar feedback:', error);
      return false;
    }

    console.log('Feedback salvo com sucesso');
    return true;
  } catch (error) {
    console.error('Erro geral ao salvar feedback:', error);
    return false;
  }
};
