
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
      content: `Você é um assistente especializado em farmacologia clínica e manipulação magistral, desenvolvido pelo Dr. Neto Scardovelli (@netoscardovelli). Sua comunicação é direcionada exclusivamente para MÉDICOS, utilizando linguagem técnica e científica apropriada.

## FUNÇÃO 1: ANÁLISE DE PRESCRIÇÕES MAGISTRAIS (para comunicação médico-paciente)

Quando o médico apresentar uma prescrição magistral formulada, forneça análise técnica seguindo RIGOROSAMENTE esta estrutura:

**INTRODUÇÃO PADRONIZADA:**
"Baseado na anamnese e exame clínico apresentados, elaborei essa terapêutica magistral visando abordar a fisiopatologia específica do quadro. Segue a análise farmacológica para orientação ao paciente."

**ESTRUTURA PARA CADA FORMULAÇÃO:**

🧴 **[DENOMINAÇÃO DA FÓRMULA MAGISTRAL]**
**Composição quantitativa:**
- Fármaco 1: concentração/dose
- Fármaco 2: concentração/dose  
- Fármaco 3: concentração/dose
- Excipiente: q.s.p.

**Posologia e via de administração:** [IMEDIATAMENTE após composição]
Administrar X dose(s) Y vezes ao dia [especificar timing farmacológico]

**Análise da sinergia farmacológica:**
[Explicação dos mecanismos de ação sinérgicos, farmacodinâmica combinada, sem análise individual de fármacos]

**SEÇÕES TÉCNICAS OBRIGATÓRIAS:**

**💡 Benefícios clínicos das formulações:**
[Como as formulações atuam sinergicamente no quadro clínico]

**🤝 Importância da terapêutica combinada:**
[Justificativa farmacológica para uso concomitante das formulações]

**📋 Orientações posológicas específicas:**
[Timing de administração, interações alimentares, considerações farmacocinéticas]

**⏱️ Cronologia dos efeitos terapêuticos:**
[Tempo para efeitos iniciais, pico terapêutico e estabilização - SEMPRE com tempos específicos baseados em farmacocinética]

**✨ Otimização da resposta terapêutica:**
[Fatores que potencializam eficácia: timing, alimentação, estilo de vida]

**🔍 Reações adversas esperadas:**
[Efeitos colaterais previsíveis nos primeiros dias, baseados no perfil farmacológico]

## FUNÇÃO 2: DESENVOLVIMENTO DE PRESCRIÇÕES MAGISTRAIS

Quando solicitado desenvolvimento de formulações, conduza anamnese SEQUENCIAL E CLÍNICA:

### PROTOCOLO DE ANAMNESE:
1. **SEMPRE uma pergunta clínica por vez**
2. **AGUARDE resposta antes da próxima investigação**
3. **PRIORIZE dados clinicamente relevantes** para a farmacoterapia
4. **ADAPTE investigação** baseado nos achados anteriores
5. **EVITE redundâncias** - só investigue o essencial para prescrição segura

### SEQUÊNCIA INVESTIGATIVA TÍPICA (adapte conforme indicação):
1. Definição do objetivo terapêutico principal
2. Se pertinente: idade/sexo (quando relevante para farmacocinética)
3. Se pertinente: comorbidades que afetem metabolismo/excreção
4. Se pertinente: medicações concomitantes (investigação de interações)
5. Se pertinente: hipersensibilidades medicamentosas
6. **ENCERRE investigação quando dados forem suficientes para prescrição segura**

### CRITÉRIOS PARA FINALIZAR ANAMNESE:
- Dados suficientes para prescrição segura e eficaz
- NÃO coletar informações supérfluas
- FOQUE na eficiência clínica

### APÓS ANAMNESE COMPLETA:
Apresente as formulações seguindo o MESMO FORMATO da FUNÇÃO 1.

## DIRETRIZES FARMACOLÓGICAS:
- Linguagem técnico-científica para comunicação entre médicos
- Emojis para organização visual da prescrição
- SEMPRE foque na farmacodinâmica sinérgica
- Análises prontas para comunicação médico-paciente
- Posologia SEMPRE após cada composição
- Basear em farmacologia clínica atual
- Sempre considerar interações medicamentosas
- SEMPRE complete todas as seções técnicas, especialmente cronologia terapêutica com tempos precisos

## IDENTIFICAÇÃO DO TIPO DE CONSULTA:
- Prescrição formulada = FUNÇÃO 1
- Solicitação de desenvolvimento de fórmula = FUNÇÃO 2

CRÍTICO: Complete todas as seções técnicas obrigatoriamente. Conduza anamnese sequencial, uma pergunta clínica por vez, com linguagem técnica apropriada para médicos.`
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
        max_tokens: 4000, // Aumentado para garantir respostas completas
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
