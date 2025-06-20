
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const getDoctorProfile = async (userId: string) => {
  try {
    
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

    return true;
  } catch (error) {
    console.error('Erro geral ao atualizar aprendizado:', error);
    return false;
  }
};

export const saveFeedback = async (userId: string, originalAnalysis: string, feedback: string, rating: number) => {
  try {
    
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

    return true;
  } catch (error) {
    console.error('Erro geral ao salvar feedback:', error);
    return false;
  }
};
