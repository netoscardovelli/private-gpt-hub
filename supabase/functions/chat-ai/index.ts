
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from './prompts.ts';
import { corsHeaders, handleCorsOptions, handleApiError, callOpenAI } from './api-utils.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const { message, conversationHistory = [], customActives = [] } = await req.json();
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    // Pegar a chave da API dos secrets do Supabase
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não encontrada nos secrets');
      throw new Error('Chave da API OpenAI não configurada');
    }

    console.log('Iniciando chamada para OpenAI...');
    console.log('Chave API disponível:', OPENAI_API_KEY ? 'Sim' : 'Não');
    console.log('Ativos personalizados recebidos:', customActives.length);

    // Preparar mensagens para o contexto de análise de fórmulas de manipulação farmacêutica
    const systemMessage = {
      role: 'system',
      content: buildSystemPrompt(customActives)
    };

    const messages = [
      systemMessage,
      ...conversationHistory.slice(-10), // Últimas 10 mensagens para contexto
      { role: 'user', content: message }
    ];

    const data = await callOpenAI(messages, OPENAI_API_KEY);
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return handleApiError(error);
  }
});
