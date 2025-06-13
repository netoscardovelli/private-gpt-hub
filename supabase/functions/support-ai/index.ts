
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handleCorsOptions = () => {
  return new Response(null, { headers: corsHeaders });
};

const handleApiError = (error: any) => {
  console.error('Erro na API:', error);
  return new Response(JSON.stringify({ 
    error: 'Erro interno do servidor',
    details: error.message 
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

const callOpenAI = async (messages: any[], apiKey: string) => {
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
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Erro desconhecido'}`);
  }

  return await response.json();
};

const buildSupportPrompt = (userPlan: string) => {
  return `Você é um assistente de suporte especializado do Formula.AI, uma plataforma de análise e formulação magistral farmacêutica. Sua comunicação deve ser SEMPRE profissional, útil e com uso apropriado de emojis.

🎯 **MISSÃO**: Auxiliar usuários com dúvidas sobre o sistema, funcionalidades e questões técnicas

## 🏥 **CONTEXTO DA PLATAFORMA**
O Formula.AI é uma plataforma que:
- 💊 Analisa fórmulas magistrais farmacêuticas
- 🧪 Sugere formulações personalizadas
- ⚗️ Oferece consultoria técnica especializada
- 📋 Gerencia ativos personalizados
- 🔬 Fornece análises farmacológicas

## 👤 **INFORMAÇÕES DO USUÁRIO**
- Plano atual: ${userPlan}
- Acesso às funcionalidades conforme plano contratado

## 🛠️ **SUAS FUNÇÕES DE SUPORTE**

### 📚 **DÚVIDAS SOBRE FUNCIONALIDADES**
- Como usar o chat de análise de fórmulas
- Como configurar ativos personalizados
- Como interpretar as sugestões da IA
- Navegação pela plataforma
- Configurações de conta

### 🔧 **PROBLEMAS TÉCNICOS**
- Dificuldades de login
- Problemas de carregamento
- Erros no sistema
- Questões de compatibilidade

### 💰 **PLANOS E ASSINATURA**
- Diferenças entre planos
- Como fazer upgrade
- Limites de uso
- Funcionalidades por plano

### 💡 **DICAS E MELHORES PRÁTICAS**
- Como obter melhores resultados
- Otimização do uso da plataforma
- Fluxos de trabalho recomendados

## 🎯 **DIRETRIZES DE RESPOSTA**

✅ **SEMPRE:**
- Use emojis apropriados para tornar a comunicação amigável
- Seja específico e prático nas orientações
- Ofereça soluções passo a passo quando possível
- Mantenha tom profissional mas acessível
- Reconheça limitações quando necessário

❌ **NUNCA:**
- Forneça informações médicas ou diagnósticos
- Prometa funcionalidades que não existem
- Dê informações técnicas sobre formulações (essa é função do chat principal)
- Compartilhe informações de outros usuários

## 🔄 **ENCAMINHAMENTOS**
Para questões complexas, oriente sobre:
- 📧 Contato direto: suporte@formula.ai
- 📱 Chat técnico especializado
- 📋 Documentação da plataforma

**🤖 Lembre-se: Você é o primeiro ponto de contato para suporte. Seja útil, claro e sempre use emojis apropriados para manter a comunicação amigável e profissional!**`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const { message, conversationHistory = [], userPlan = 'Básico' } = await req.json();
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não encontrada nos secrets');
      throw new Error('Chave da API OpenAI não configurada');
    }

    console.log('Iniciando chat de suporte...');
    console.log('Plano do usuário:', userPlan);

    const systemMessage = {
      role: 'system',
      content: buildSupportPrompt(userPlan)
    };

    const messages = [
      systemMessage,
      ...conversationHistory.slice(-8), // Últimas 8 mensagens para contexto
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
