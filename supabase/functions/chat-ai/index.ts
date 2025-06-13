
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from './prompts.ts';

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
  console.log('Fazendo requisição para OpenAI API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  console.log('Resposta da OpenAI - Status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro da OpenAI:', { 
      status: response.status, 
      statusText: response.statusText,
      error: errorText 
    });
    
    if (response.status === 401) {
      throw new Error('Chave da API OpenAI inválida ou expirada. Verifique se a chave está correta nos secrets do Supabase.');
    } else if (response.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos');
    } else if (response.status === 403) {
      throw new Error('Acesso negado. Verifique as permissões da sua chave API');
    } else {
      throw new Error(`Erro da OpenAI: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();
  console.log('Resposta recebida da OpenAI com sucesso');

  return data;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    console.log('Iniciando processamento da requisição...');
    
    const requestBody = await req.json();
    console.log('Body recebido:', {
      hasMessage: !!requestBody.message,
      messageLength: requestBody.message?.length || 0,
      historyLength: requestBody.conversationHistory?.length || 0,
      customActivesLength: requestBody.customActives?.length || 0
    });

    const { message, conversationHistory = [], customActives = [] } = requestBody;
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    // Pegar a chave da API dos secrets do Supabase
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não encontrada nos secrets');
      throw new Error('Chave da API OpenAI não configurada');
    }

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

    console.log('Preparando chamada para OpenAI com', messages.length, 'mensagens');

    const data = await callOpenAI(messages, OPENAI_API_KEY);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inválida da OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    console.log('Resposta processada com sucesso');

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
