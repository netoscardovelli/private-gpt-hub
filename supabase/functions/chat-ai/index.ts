
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt, buildLearningPrompt } from './prompts.ts';
import { getDoctorProfile, updateDoctorLearning, saveFeedback } from './learning.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handleCorsOptions = () => {
  return new Response(null, { headers: corsHeaders });
};

const handleApiError = (error: any) => {
  console.error('Erro na função chat-ai:', error);
  console.error('Stack trace:', error.stack);
  
  return new Response(JSON.stringify({ 
    error: 'Erro interno do servidor',
    details: error.message 
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

const callOpenAI = async (messages: any[], apiKey: string) => {
  console.log('Chamando OpenAI API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14', // Modelo mais avançado para análises profundas
      messages: messages,
      temperature: 0.3, // Menor para mais precisão científica
      max_tokens: 4000, // Aumentado para análises detalhadas
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro da OpenAI:', { 
      status: response.status, 
      statusText: response.statusText,
      error: errorText 
    });
    
    if (response.status === 401) {
      throw new Error('Chave da API OpenAI inválida ou expirada');
    } else if (response.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos');
    } else if (response.status === 403) {
      throw new Error('Acesso negado. Verifique as permissões da sua chave API');
    } else {
      throw new Error(`Erro da OpenAI: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();
  console.log('Resposta da OpenAI recebida');

  return data;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    console.log('Processando requisição...');
    
    const requestBody = await req.json();
    const { 
      message, 
      conversationHistory = [], 
      customActives = [], 
      userId = null,
      feedback = null,
      originalAnalysis = null,
      rating = null
    } = requestBody;
    
    // Se é um feedback para aprendizado
    if (feedback && userId && originalAnalysis) {
      console.log('Processando feedback...');
      
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      
      if (!OPENAI_API_KEY) {
        throw new Error('Chave da API OpenAI não configurada');
      }

      // Salvar feedback de forma assíncrona (não bloqueia resposta)
      saveFeedback(userId, originalAnalysis, feedback, rating || 0).catch(console.error);

      // Processar aprendizado com IA de forma assíncrona
      const learningPrompt = buildLearningPrompt(userId, feedback, originalAnalysis);
      
      const learningMessages = [
        { role: 'system', content: 'Você é um especialista em análise de padrões médicos. Extraia informações estruturadas do feedback fornecido.' },
        { role: 'user', content: learningPrompt }
      ];

      // Executar em background para não bloquear resposta
      callOpenAI(learningMessages, OPENAI_API_KEY)
        .then(async (learningResponse) => {
          if (learningResponse.choices && learningResponse.choices[0]) {
            try {
              const learningData = JSON.parse(learningResponse.choices[0].message.content);
              await updateDoctorLearning(userId, learningData);
            } catch (parseError) {
              console.error('Erro ao processar resposta de aprendizado:', parseError);
            }
          }
        })
        .catch(console.error);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Feedback processado com sucesso!' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não encontrada');
      throw new Error('Chave da API OpenAI não configurada');
    }

    // Buscar perfil do médico
    let doctorProfile = null;
    if (userId) {
      try {
        doctorProfile = await getDoctorProfile(userId);
      } catch (error) {
        console.log('Perfil não carregado, continuando sem personalização');
      }
    }

    console.log('Preparando mensagens...');

    // Preparar mensagens com perfil personalizado
    const systemMessage = {
      role: 'system',
      content: buildSystemPrompt(customActives, doctorProfile)
    };

    // Histórico mais extenso para análises complexas
    const messages = [
      systemMessage,
      ...conversationHistory.slice(-4), // Últimas 4 mensagens para contexto
      { role: 'user', content: message }
    ];

    console.log('Enviando para OpenAI...');

    const data = await callOpenAI(messages, OPENAI_API_KEY);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inválida da OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    console.log('Análise detalhada concluída');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro geral na função:', error);
    return handleApiError(error);
  }
});
