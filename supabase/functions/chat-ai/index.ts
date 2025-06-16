
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildSystemPrompt, buildLearningPrompt } from './prompts.ts';
import { getDoctorProfile, updateDoctorLearning, saveFeedback } from './learning.ts';
import { buildReferenceContext } from './formula-reference.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processando requisição...');
    
    const { 
      message, 
      specialty = 'geral', 
      customActives = [], 
      userId,
      feedback,
      originalAnalysis,
      rating
    } = await req.json();

    // Se é feedback, processar aprendizado
    if (feedback && originalAnalysis && userId) {
      console.log('Processando feedback para aprendizado...');
      
      // Salvar feedback
      await saveFeedback(userId, originalAnalysis, feedback, rating || 5);
      
      // Processar com OpenAI para extrair padrões
      const learningPrompt = buildLearningPrompt(userId, feedback, originalAnalysis);
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: learningPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (openaiResponse.ok) {
        const learningResult = await openaiResponse.json();
        const learningData = learningResult.choices[0]?.message?.content;
        
        try {
          const parsedLearning = JSON.parse(learningData);
          await updateDoctorLearning(userId, parsedLearning);
          console.log('Aprendizado processado e salvo');
        } catch (e) {
          console.log('Erro ao parsear dados de aprendizado:', e);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Feedback processado com sucesso!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    console.log('Preparando mensagens com especialidade:', specialty);

    // Buscar perfil do médico se userId fornecido
    let doctorProfile = null;
    if (userId) {
      doctorProfile = await getDoctorProfile(userId);
      console.log('Perfil do médico carregado:', doctorProfile?.specialty || 'Sem perfil');
    }

    // Construir prompt do sistema com contexto de referência
    const systemPrompt = await buildSystemPrompt(customActives, doctorProfile, specialty, message);

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Enviando para OpenAI...');

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('Chamando OpenAI API com modelo avançado...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da OpenAI API:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta da OpenAI recebida com modelo avançado');

    const aiResponse = data.choices[0]?.message?.content || 'Desculpe, não foi possível gerar uma resposta.';

    console.log('Análise médica avançada concluída');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: 'gpt-4o',
        hasReferenceContext: true
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
