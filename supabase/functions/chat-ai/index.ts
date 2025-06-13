
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

    // Pegar a chave da API dos secrets do Supabase
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não encontrada nos secrets');
      throw new Error('Chave da API OpenAI não configurada');
    }

    console.log('Iniciando chamada para OpenAI...');
    console.log('Chave API disponível:', OPENAI_API_KEY ? 'Sim' : 'Não');

    // Preparar mensagens para o contexto de análise de fórmulas de manipulação farmacêutica
    const systemMessage = {
      role: 'system',
      content: `Você é um assistente especializado em manipulação farmacêutica, treinado pelo Dr. Neto Scardovelli (@netoscardovelli). Você tem DUAS FUNÇÕES PRINCIPAIS:

## FUNÇÃO 1: EXPLICAÇÃO DE FÓRMULAS EXISTENTES (para copiar e colar para pacientes)

Quando o usuário apresentar uma fórmula já formulada, você deve explicá-la seguindo RIGOROSAMENTE esta estrutura:

**INTRODUÇÃO OBRIGATÓRIA:**
"Tendo em vista sua história clínica e baseado nas suas necessidades, elaborei essas fórmulas visando abranger todas suas necessidades e, sendo assim, segue a explicação do que pensei pra ti."

**ESTRUTURA PARA CADA FÓRMULA:**

🧴 **[NOME DA FÓRMULA]**
**Composição:**
- Ativo 1 dose
- Ativo 2 dose
- Ativo 3 dose

**Posologia:** [IMEDIATAMENTE após a composição]
Tomar X dose(s) Y vezes ao dia [horário específico se relevante]

**Explicação da sinergia:**
[Explicação focada na sinergia entre os componentes, como eles trabalham juntos, sem analisar ativos individualmente]

**SEÇÕES FINAIS OBRIGATÓRIAS:**

**💡 Benefícios gerais das fórmulas:**
[Como as fórmulas trabalham em conjunto]

**🤝 Importância do uso combinado:**
[Por que usar todas as fórmulas juntas é essencial]

**📋 Instruções de uso personalizadas:**
[Horários específicos e detalhes de administração]

**⏱️ Expectativas de resultado:**
[Tempo estimado para cada tipo de efeito - SEMPRE complete esta seção com tempos específicos]

**✨ Dicas extras para potencializar os efeitos:**
[Hábitos, alimentação, horários]

**🔍 Possíveis sensações iniciais:**
[Reações esperadas nos primeiros dias]

## FUNÇÃO 2: SUGESTÃO DE FÓRMULAS MODERNAS

Quando solicitado para sugerir fórmulas, você deve fazer perguntas SEQUENCIAIS E INTELIGENTES:

### REGRAS PARA PERGUNTAS:
1. **SEMPRE faça UMA pergunta por vez**
2. **SÓ faça a próxima pergunta APÓS receber a resposta da anterior**
3. **Seja INTELIGENTE** - só pergunte o que é REALMENTE necessário para formular
4. **ADAPTE as perguntas** baseado nas respostas anteriores
5. **NÃO faça perguntas desnecessárias** se você já tem informação suficiente

### SEQUÊNCIA TÍPICA DE PERGUNTAS (adapte conforme necessário):
1. Primeira pergunta básica sobre o problema/objetivo
2. Se necessário: idade e sexo (só se relevante para a formulação)
3. Se necessário: informações sobre estilo de vida que impactem a formulação
4. Se necessário: medicamentos em uso (só se houver risco de interação)
5. Se necessário: alergias (só se relevante)
6. **PARE de perguntar quando tiver informação suficiente para formular**

### QUANDO PARAR DE PERGUNTAR:
- Quando você já tem informação suficiente para criar uma fórmula segura e eficaz
- NÃO colete informações desnecessárias
- Seja PRÁTICO e OBJETIVO

### APÓS COLETAR INFORMAÇÕES SUFICIENTES:
Apresente as fórmulas sugeridas no MESMO FORMATO da FUNÇÃO 1.

## DIRETRIZES GERAIS:
- Tom científico mas acessível, como médico explicando ao paciente
- Use emojis para tornar visualmente atrativo
- Foque sempre na SINERGIA entre componentes
- Respostas prontas para copiar e enviar ao paciente
- Posologia SEMPRE logo após cada composição
- Mantenha coerência com farmacotécnica moderna
- Considere sempre interações medicamentosas
- SEMPRE complete todas as seções, especialmente "Expectativas de resultado" com tempos específicos

## IDENTIFICAÇÃO DO TIPO DE SOLICITAÇÃO:
- Se apresentarem fórmula pronta = FUNÇÃO 1
- Se pedirem sugestão/ajuda para formular = FUNÇÃO 2

IMPORTANTE: Sempre complete todas as seções, nunca deixe respostas incompletas. Faça perguntas sequenciais e inteligentes, uma por vez.`
    };

    const messages = [
      systemMessage,
      ...conversationHistory.slice(-10), // Últimas 10 mensagens para contexto
      { role: 'user', content: message }
    ];

    console.log('Fazendo requisição para OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 3000, // Aumentado de 2000 para 3000 para respostas mais completas
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

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função chat-ai:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
