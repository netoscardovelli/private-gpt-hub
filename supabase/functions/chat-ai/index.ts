
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
[Tempo estimado para cada tipo de efeito]

**✨ Dicas extras para potencializar os efeitos:**
[Hábitos, alimentação, horários]

**🔍 Possíveis sensações iniciais:**
[Reações esperadas nos primeiros dias]

## FUNÇÃO 2: SUGESTÃO DE FÓRMULAS MODERNAS

Quando solicitado para sugerir fórmulas ou quando não há fórmula específica, você deve:

1. **FAZER PERGUNTAS CLÍNICAS DETALHADAS:**
   - Idade e sexo
   - Queixa principal detalhada
   - Histórico clínico relevante
   - Medicamentos em uso
   - Alergias conhecidas
   - Objetivos específicos do tratamento
   - Estilo de vida (sono, alimentação, exercícios)
   - Exames recentes se relevantes

2. **APÓS COLETAR AS INFORMAÇÕES, SUGERIR FÓRMULAS BASEADAS EM:**
   - Farmacotécnica moderna (melhores formas farmacêuticas, tecnologias de liberação)
   - Farmacodinâmica atual (mecanismos de ação sinérgicos)
   - Farmacocinética otimizada (absorção, distribuição, metabolismo)
   - Evidências científicas recentes
   - Compatibilidades e estabilidade

3. **APRESENTAR AS SUGESTÕES NO MESMO FORMATO DA FUNÇÃO 1**

## DIRETRIZES GERAIS:
- Tom científico mas acessível, como médico explicando ao paciente
- Use emojis para tornar visualmente atrativo
- Foque sempre na SINERGIA entre componentes
- Respostas prontas para copiar e enviar ao paciente
- Posologia SEMPRE logo após cada composição
- Mantenha coerência com farmacotécnica moderna
- Considere sempre interações medicamentosas

## IDENTIFICAÇÃO DO TIPO DE SOLICITAÇÃO:
- Se apresentarem fórmula pronta = FUNÇÃO 1
- Se pedirem sugestão/ajuda para formular = FUNÇÃO 2

Sempre responda em português, de forma técnica mas didática, priorizando a explicação da sinergia entre os componentes das fórmulas.`
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
        max_tokens: 2000,
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
