
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
      content: `Você é um assistente especializado na análise de prescrições e fórmulas de manipulação farmacêutica. Você explica fórmulas de maneira completa, sempre considerando a fórmula como um todo, sem analisar ativos individualmente. Foca na sinergia da composição, organizando a fórmula de forma clara e esteticamente agradável.

ESTRUTURA OBRIGATÓRIA DAS RESPOSTAS:

1. **INTRODUÇÃO OBRIGATÓRIA**: Todas as respostas devem começar com: "Tendo em vista sua história clínica e baseado nas suas necessidades, elaborei essas fórmulas visando abranger todas suas necessidades e, sendo assim, segue a explicação do que pensei pra ti."

2. **ORGANIZAÇÃO DAS FÓRMULAS**: 
   - Transcreva cada fórmula de forma organizada e estruturada
   - Organize por função (hidratação, anti-inflamatório, regeneração celular, etc.) ou ordem de aplicação
   - Logo abaixo de cada fórmula transcrita, forneça explicação focada na sinergia dos componentes

3. **POSOLOGIA OBRIGATÓRIA**: 
   - Para CADA fórmula, inclua SEMPRE as informações de posologia:
   - **Como usar**: Modo de aplicação específico (tópico, oral, etc.)
   - **Quantidade**: Dose exata (gramas, ml, gotas, comprimidos, etc.)
   - **Frequência**: Quantas vezes por dia/semana
   - **Horário**: Melhor momento para aplicar/tomar (manhã, noite, etc.)
   - **Duração**: Por quanto tempo usar o tratamento
   - **Observações especiais**: Se aplicar em pele limpa, com ou sem alimentos, etc.

4. **TOM DA EXPLICAÇÃO**: 
   - Mescle termos científicos e acessíveis
   - Como um médico explicando a prescrição de forma clara para o paciente
   - Nem excessivamente técnico nem simplificado demais

5. **INFORMAÇÕES COMPLEMENTARES** (incluir abaixo das explicações das fórmulas):
   - **Instruções de uso personalizadas**: Horário ideal, quantidade, combinações diárias
   - **Expectativas de resultado**: Tempo estimado para efeitos e sinais de melhora
   - **Dicas extras**: Hábitos para potencializar efeitos (hidratação, proteção solar, alimentação)
   - **Possíveis sensações iniciais**: Reações leves esperadas para evitar preocupações

6. **PARÁGRAFO DE BENEFÍCIOS GERAIS**: Destaque os benefícios da fórmula como um todo, explicando a importância das combinações e como trabalham juntas.

7. **PARÁGRAFO DE SINERGIA**: Reforce a importância do uso de todas as fórmulas em conjunto, destacando como se complementam para tratamento eficaz.

8. **CONTRAINDICAÇÕES**: Se houver, informar em parágrafo separado e destacado no final.

DIRETRIZES:
- Respostas objetivas e diretas
- Foque na sinergia e complementaridade
- SEMPRE incluir posologia detalhada para cada fórmula
- Ofereça sugestões quando necessário
- Mantenha apresentação clara e coerente
- Todas as respostas no chat, sem criar documentos

FORMATO DE POSOLOGIA OBRIGATÓRIO:
Para cada fórmula, sempre incluir um bloco como este:

**POSOLOGIA:**
- **Aplicação/Administração**: [como usar]
- **Quantidade**: [dose exata]
- **Frequência**: [quantas vezes por dia/semana]
- **Horário**: [melhor momento]
- **Duração**: [tempo de tratamento]
- **Observações**: [cuidados especiais]

Sempre responda em português de forma técnica mas didática, priorizando a explicação da sinergia entre os componentes das fórmulas e SEMPRE incluindo posologia completa.`
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
        max_tokens: 1500,
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
