
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildSystemPrompt, buildLearningPrompt } from './prompts.ts';
import { getDoctorProfile, updateDoctorLearning, saveFeedback } from './learning.ts';
import { buildReferenceContext } from './formula-reference.ts';
import { processAutoLearning } from './auto-learning.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Estrutura de logging melhorada
const logWithMetrics = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    service: 'chat-ai',
    ...data
  };
  console.log(JSON.stringify(logEntry));
};

// Função para medir performance
const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    logWithMetrics('info', 'Operation completed', {
      operation,
      duration: `${duration.toFixed(2)}ms`,
      success: true
    });
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logWithMetrics('error', 'Operation failed', {
      operation,
      duration: `${duration.toFixed(2)}ms`,
      success: false,
      error: error.message
    });
    
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startTime = performance.now();

  try {
    logWithMetrics('info', 'Processing chat-ai request', { 
      requestId,
      method: req.method,
      url: req.url 
    });
    
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
      logWithMetrics('info', 'Processing feedback for learning', { 
        requestId, 
        userId,
        rating 
      });
      
      const { result: feedbackResult } = await measurePerformance('save-feedback', async () => {
        await saveFeedback(userId, originalAnalysis, feedback, rating || 5);
        return true;
      });
      
      const learningPrompt = buildLearningPrompt(userId, feedback, originalAnalysis);
      
      const { result: learningResponse } = await measurePerformance('openai-learning', async () => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        return response.json();
      });

      if (learningResponse) {
        const learningData = learningResponse.choices[0]?.message?.content;
        
        try {
          const parsedLearning = JSON.parse(learningData);
          await measurePerformance('update-learning', async () => {
            await updateDoctorLearning(userId, parsedLearning);
          });
          
          logWithMetrics('info', 'Learning processed successfully', { requestId, userId });
        } catch (e) {
          logWithMetrics('error', 'Failed to parse learning data', { 
            requestId, 
            userId, 
            error: e.message 
          });
        }
      }

      const totalTime = performance.now() - startTime;
      
      logWithMetrics('info', 'Feedback processing completed', {
        requestId,
        processingTime: `${totalTime.toFixed(2)}ms`
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Feedback processado com sucesso!',
          requestId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    logWithMetrics('info', 'Preparing messages', { 
      requestId, 
      specialty, 
      userId,
      hasCustomActives: customActives.length > 0
    });

    // Buscar perfil do médico se userId fornecido
    let doctorProfile = null;
    if (userId) {
      const { result: profile } = await measurePerformance('get-doctor-profile', async () => {
        return await getDoctorProfile(userId);
      });
      doctorProfile = profile;
      
      logWithMetrics('info', 'Doctor profile loaded', { 
        requestId, 
        userId,
        specialty: doctorProfile?.specialty || 'No profile' 
      });
    }

    // Construir prompt do sistema com contexto de referência
    const { result: systemPrompt } = await measurePerformance('build-system-prompt', async () => {
      return await buildSystemPrompt(customActives, doctorProfile, specialty, message);
    });

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

    logWithMetrics('info', 'Sending request to OpenAI', { requestId });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { result: openaiResponse, duration: openaiDuration } = await measurePerformance('openai-chat', async () => {
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
        logWithMetrics('error', 'OpenAI API error', { 
          requestId, 
          status: response.status, 
          error: errorText 
        });
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    });

    logWithMetrics('info', 'OpenAI response received', { 
      requestId,
      openaiDuration: `${openaiDuration.toFixed(2)}ms`
    });

    const aiResponse = openaiResponse.choices[0]?.message?.content || 'Desculpe, não foi possível gerar uma resposta.';
    const tokensUsed = openaiResponse.usage?.total_tokens || 0;

    // Processar aprendizado automático baseado na interação
    if (userId) {
      logWithMetrics('info', 'Starting auto-learning', { requestId, userId });
      
      measurePerformance('auto-learning', async () => {
        await processAutoLearning(userId, message, aiResponse, specialty);
      }).catch(error => {
        logWithMetrics('error', 'Auto-learning failed', { 
          requestId, 
          userId, 
          error: error.message 
        });
      });
    }

    const totalTime = performance.now() - startTime;

    logWithMetrics('info', 'Analysis completed successfully', {
      requestId,
      processingTime: `${totalTime.toFixed(2)}ms`,
      tokensUsed,
      responseLength: aiResponse.length
    });

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: 'gpt-4o',
        hasReferenceContext: true,
        tokens: tokensUsed,
        processingTime: totalTime,
        requestId
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    const totalTime = performance.now() - startTime;
    
    logWithMetrics('error', 'Function execution failed', {
      requestId,
      processingTime: `${totalTime.toFixed(2)}ms`,
      error: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString(),
        processingTime: totalTime,
        requestId
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
