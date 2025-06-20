
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') ?? '',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handleCorsOptions = () => {
  return new Response(null, { headers: corsHeaders });
};

const handleApiError = (error: any) => {
  console.error('Erro na função support-ai:', error);
  console.error('Stack trace:', error.stack);
  
  return new Response(JSON.stringify({ 
    error: 'Erro interno do servidor',
    details: error.message 
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

const callSupportAI = async (messages: any[], apiKey: string) => {

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
      max_tokens: 1500,
    }),
  });


  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro da Support AI:', { 
      status: response.status, 
      statusText: response.statusText,
      error: errorText 
    });
    
    if (response.status === 401) {
      throw new Error('Chave da API Support AI inválida ou expirada. Verifique se a chave está correta nos secrets do Supabase.');
    } else if (response.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos');
    } else if (response.status === 403) {
      throw new Error('Acesso negado. Verifique as permissões da sua chave API');
    } else {
      throw new Error(`Erro da Support AI: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();

  return data;
};

const buildSupportSystemPrompt = (userPlan: string) => {
  return `Você é um assistente de suporte especializado do Formula.AI, uma plataforma de análise de fórmulas farmacêuticas magistrais.

🎯 **MISSÃO**: Fornecer suporte técnico e esclarecer dúvidas sobre o sistema

## 🤖 **SUAS ESPECIALIDADES**
- 💡 Explicar funcionalidades do sistema
- 🔧 Resolver problemas técnicos básicos
- 📋 Orientar sobre uso das ferramentas
- 💰 Informações sobre planos e assinatura
- ⚙️ Configurações da conta

## 📋 **PROTOCOLO DE ATENDIMENTO**

### ✅ **Para DÚVIDAS sobre funcionalidades:**
- Explique de forma clara e didática
- Use exemplos práticos quando relevante
- Forneça passos detalhados quando necessário

### 🔧 **Para PROBLEMAS técnicos:**
- Solicite informações específicas sobre o erro
- Ofereça soluções step-by-step
- Sugira alternativas quando apropriado

### 💰 **Plano atual do usuário:** ${userPlan}
- Explique limitações do plano quando relevante
- Sugira upgrades apenas quando necessário
- Informe sobre recursos disponíveis

## 🎯 **DIRETRIZES DE RESPOSTA**

✅ **SEMPRE:**
- 😊 Use emojis para facilitar a leitura
- 🔍 Seja específico e objetivo
- 💡 Ofereça soluções práticas
- 🤝 Mantenha tom amigável e profissional
- ⚡ Responda de forma eficiente

❌ **NUNCA:**
- 🚫 Forneça informações técnicas sobre manipulação farmacêutica
- 💊 Dê conselhos médicos ou farmacêuticos
- 🏥 Substitua consulta profissional
- 🔐 Solicite senhas ou informações sensíveis

## 🆘 **ESCALAÇÃO DE SUPORTE**

Para problemas complexos que não conseguir resolver:
📧 "Para esta questão específica, recomendo entrar em contato com nosso suporte técnico através do email: suporte@formula.ai"

**🤖 Lembre-se: Você é um assistente de suporte. Seja prestativo, claro e sempre focado em resolver as dúvidas do usuário!**`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const { message, conversationHistory = [], userPlan = 'Free' } = await req.json();
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    // Pegar a chave da API de suporte dos secrets do Supabase
    const SUPPORT_API_KEY = Deno.env.get('SUPPORT_API_KEY');
    
    if (!SUPPORT_API_KEY) {
      console.error('SUPPORT_API_KEY não encontrada nos secrets');
      throw new Error('Chave da API de Suporte não configurada');
    }


    // Preparar mensagens para o contexto de suporte
    const systemMessage = {
      role: 'system',
      content: buildSupportSystemPrompt(userPlan)
    };

    const messages = [
      systemMessage,
      ...conversationHistory.slice(-8), // Últimas 8 mensagens para contexto
      { role: 'user', content: message }
    ];

    const data = await callSupportAI(messages, SUPPORT_API_KEY);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inválida da API');
    }
    
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
