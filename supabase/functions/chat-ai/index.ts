
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    // Verificar se a chave existe e tem formato válido
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    console.log('Verificando OPENAI_API_KEY...');
    console.log('Chave presente:', !!OPENAI_API_KEY);
    console.log('Tipo da chave:', typeof OPENAI_API_KEY);
    console.log('Comprimento da chave:', OPENAI_API_KEY?.length || 0);
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      console.error('OPENAI_API_KEY não encontrada ou vazia');
      throw new Error('Chave da API OpenAI não configurada ou inválida');
    }

    // Verificar se a chave tem o formato esperado
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      console.error('OPENAI_API_KEY não tem o formato esperado (deve começar com sk-)');
      throw new Error('Chave da API OpenAI inválida - formato incorreto');
    }

    console.log('Enviando mensagem para OpenAI:', message);

    // Preparar mensagens para o contexto de análise de fórmulas
    const systemMessage = {
      role: 'system',
      content: `Você é um assistente especializado em análise de fórmulas matemáticas, do Excel, Google Sheets e outras ferramentas similares. Você ajuda usuários a:

1. Criar fórmulas baseadas em descrições
2. Explicar fórmulas complexas de forma simples
3. Otimizar fórmulas existentes
4. Identificar e corrigir erros em fórmulas
5. Sugerir alternativas mais eficientes

Sempre responda em português e seja claro e didático nas explicações. Quando mostrar fórmulas, use formatação adequada e explique cada parte quando necessário.`
    };

    const messages = [
      systemMessage,
      ...conversationHistory.slice(-10), // Últimas 10 mensagens para contexto
      { role: 'user', content: message }
    ];

    console.log('Fazendo requisição para OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log('Status da resposta OpenAI:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da OpenAI:', errorText);
      
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
    console.log('Resposta recebida da OpenAI com sucesso');

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função chat-ai:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
