
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const processAutoLearning = async (userId: string, userMessage: string, aiResponse: string, specialty: string) => {
  try {
    
    // Analisar padrões automáticos na mensagem do usuário
    const patterns = await analyzeUserPatterns(userMessage, specialty);
    
    // Analisar resposta da IA para extrair ativos e concentrações mencionados
    const responsePatterns = await analyzeAIResponse(aiResponse);
    
    // Salvar interação para análise de padrões
    await saveInteractionPattern(userId, userMessage, aiResponse, specialty, patterns, responsePatterns);
    
    // Atualizar perfil automaticamente baseado nos padrões
    await updateProfileAutomatically(userId, patterns, responsePatterns, specialty);
    
    // auto learning processed
    return true;
  } catch (error) {
    console.error('❌ Erro no aprendizado automático:', error);
    return false;
  }
};

const analyzeUserPatterns = async (message: string, specialty: string) => {
  const patterns = {
    mentionedActives: [],
    mentionedConcentrations: [],
    preferredForms: [],
    focusAreas: [],
    urgencyLevel: 'normal',
    complexityLevel: 'medium'
  };

  const messageText = message.toLowerCase();

  // Detectar ativos mencionados
  const commonActives = [
    'ácido hialurônico', 'vitamina c', 'retinol', 'niacinamida', 'peptídeos',
    'colágeno', 'ácido glicólico', 'ácido salicílico', 'tretinoína', 'hidroquinona',
    'arbutina', 'kojic', 'azelaic', 'bakuchiol', 'resveratrol', 'coenzima q10',
    'vitamina e', 'ceramidas', 'ácido férulico', 'adenosina'
  ];

  patterns.mentionedActives = commonActives.filter(active => 
    messageText.includes(active) || messageText.includes(active.replace('ácido ', ''))
  );

  // Detectar concentrações mencionadas
  const concentrationRegex = /(\d+(?:\.\d+)?)\s*%/g;
  const concentrations = messageText.match(concentrationRegex) || [];
  patterns.mentionedConcentrations = concentrations;

  // Detectar formas farmacêuticas preferidas
  const forms = ['cápsula', 'sachê', 'creme', 'gel', 'loção', 'sérum', 'pomada'];
  patterns.preferredForms = forms.filter(form => messageText.includes(form));

  // Detectar áreas de foco
  const focusKeywords = {
    'anti-idade': ['rugas', 'envelhecimento', 'anti-idade', 'firmeza', 'elasticidade'],
    'clareamento': ['manchas', 'melasma', 'hiperpigmentação', 'clareamento'],
    'acne': ['acne', 'espinhas', 'oleosidade', 'comedões'],
    'hidratação': ['ressecamento', 'hidratação', 'pele seca'],
    'sensibilidade': ['sensível', 'irritação', 'vermelhidão', 'alergia']
  };

  Object.entries(focusKeywords).forEach(([area, keywords]) => {
    if (keywords.some(keyword => messageText.includes(keyword))) {
      patterns.focusAreas.push(area);
    }
  });

  // Detectar nível de urgência
  const urgencyKeywords = ['urgente', 'rápido', 'imediato', 'emergência'];
  if (urgencyKeywords.some(keyword => messageText.includes(keyword))) {
    patterns.urgencyLevel = 'high';
  }

  // Detectar complexidade
  if (message.length > 500 || patterns.mentionedActives.length > 3) {
    patterns.complexityLevel = 'high';
  } else if (message.length < 100) {
    patterns.complexityLevel = 'low';
  }

  return patterns;
};

const analyzeAIResponse = async (response: string) => {
  const patterns = {
    recommendedActives: [],
    recommendedConcentrations: {},
    responseStyle: 'standard',
    detailLevel: 'medium'
  };

  const responseText = response.toLowerCase();

  // Extrair ativos recomendados pela IA
  const activeRegex = /(\w+(?:\s+\w+)*)\s*(?::|–|-)\s*(?:concentração|dose|%)/gi;
  const matches = response.match(activeRegex) || [];
  patterns.recommendedActives = matches.map(match => 
    match.split(/:|–|-/)[0].trim()
  ).slice(0, 10);

  // Extrair concentrações recomendadas
  const concRegex = /(\w+(?:\s+\w+)*)\s*(?::|–|-)\s*(\d+(?:\.\d+)?)\s*%/gi;
  let match;
  while ((match = concRegex.exec(response)) !== null) {
    const [, active, concentration] = match;
    patterns.recommendedConcentrations[active.trim()] = concentration + '%';
  }

  // Detectar estilo de resposta
  if (response.length > 2000) {
    patterns.responseStyle = 'detailed';
    patterns.detailLevel = 'high';
  } else if (response.length < 800) {
    patterns.responseStyle = 'concise';
    patterns.detailLevel = 'low';
  }

  return patterns;
};

const saveInteractionPattern = async (userId: string, userMessage: string, aiResponse: string, specialty: string, userPatterns: any, responsePatterns: any) => {
  try {
    const { error } = await supabaseClient
      .from('interaction_patterns')
      .insert({
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        specialty: specialty,
        user_patterns: userPatterns,
        response_patterns: responsePatterns,
        message_length: userMessage.length,
        response_length: aiResponse.length,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar padrão de interação:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro geral ao salvar padrão:', error);
    return false;
  }
};

const updateProfileAutomatically = async (userId: string, userPatterns: any, responsePatterns: any, specialty: string) => {
  try {
    // Buscar perfil atual
    const { data: currentProfile } = await supabaseClient
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!currentProfile) return false;

    // Mergear novos padrões com existentes
    const updatedPreferredActives = mergeArrays(
      currentProfile.preferred_actives || [],
      [...userPatterns.mentionedActives, ...responsePatterns.recommendedActives]
    );

    const updatedConcentrationPrefs = {
      ...currentProfile.concentration_preferences || {},
      ...responsePatterns.recommendedConcentrations
    };

    const updatedFocusAreas = mergeArrays(
      currentProfile.focus_areas || [],
      userPatterns.focusAreas
    );

    // Detectar estilo de formulação baseado nos padrões
    let formulationStyle = currentProfile.formulation_style || 'moderado';
    if (userPatterns.urgencyLevel === 'high' && userPatterns.complexityLevel === 'high') {
      formulationStyle = 'agressivo';
    } else if (userPatterns.urgencyLevel === 'normal' && userPatterns.complexityLevel === 'low') {
      formulationStyle = 'conservador';
    }

    // Atualizar perfil
    const { error } = await supabaseClient
      .from('doctor_profiles')
      .update({
        preferred_actives: updatedPreferredActives.slice(0, 20), // Limitar a 20 itens
        concentration_preferences: updatedConcentrationPrefs,
        focus_areas: updatedFocusAreas.slice(0, 10), // Limitar a 10 áreas
        formulation_style: formulationStyle,
        specialty: specialty, // Atualizar especialidade mais usada
        updated_at: new Date().toISOString(),
        auto_learning_count: (currentProfile.auto_learning_count || 0) + 1
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar perfil automaticamente:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro geral na atualização automática:', error);
    return false;
  }
};

const mergeArrays = (existing: string[], newItems: string[]) => {
  const merged = [...existing];
  
  newItems.forEach(item => {
    if (item && !merged.includes(item)) {
      merged.push(item);
    }
  });
  
  return merged;
};

export const getUsageAnalytics = async (userId: string) => {
  try {
    const { data, error } = await supabaseClient
      .from('interaction_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erro ao buscar analytics:', error);
      return null;
    }

    // Analisar padrões de uso
    const analytics = {
      totalInteractions: data.length,
      mostUsedSpecialty: getMostFrequent(data.map(d => d.specialty)),
      averageMessageLength: data.reduce((acc, d) => acc + d.message_length, 0) / data.length,
      preferredComplexity: getMostFrequent(data.map(d => d.user_patterns?.complexityLevel)),
      topActives: getTopItems(data.flatMap(d => d.user_patterns?.mentionedActives || [])),
      topFocusAreas: getTopItems(data.flatMap(d => d.user_patterns?.focusAreas || []))
    };

    return analytics;
  } catch (error) {
    console.error('Erro ao gerar analytics:', error);
    return null;
  }
};

const getMostFrequent = (arr: string[]) => {
  return arr.reduce((acc, val) => 
    arr.filter(v => v === val).length > arr.filter(v => v === acc).length ? val : acc
  );
};

const getTopItems = (arr: string[]) => {
  const frequency = arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([item]) => item);
};
