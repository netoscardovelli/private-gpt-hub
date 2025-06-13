
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleCorsOptions = () => {
  return new Response(null, { headers: corsHeaders });
};

export const handleApiError = (error: any, response?: Response) => {
  console.error('Erro na função chat-ai:', error);
  console.error('Stack trace:', error.stack);
  
  if (response) {
    if (response.status === 401) {
      throw new Error('Chave da API OpenAI inválida ou expirada. Verifique se a chave está correta nos secrets do Supabase.');
    } else if (response.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos');
    } else if (response.status === 403) {
      throw new Error('Acesso negado. Verifique as permissões da sua chave API');
    }
  }
  
  return new Response(JSON.stringify({ 
    error: 'Erro interno do servidor',
    details: error.message 
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

export const callOpenAI = async (messages: any[], apiKey: string) => {
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
    
    handleApiError(new Error(`Erro da OpenAI: ${response.status} - ${errorText}`), response);
  }

  const data = await response.json();
  console.log('Resposta recebida da OpenAI com sucesso');

  return data;
};
