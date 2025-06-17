
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Iniciando processamento OCR...');
    
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      throw new Error('Nenhuma imagem foi enviada');
    }

    console.log('Arquivo recebido:', imageFile.name, imageFile.type);

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('Imagem convertida para base64');

    // Usar OpenAI Vision API para extrair texto da imagem
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('Chamando OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia todo o texto visível desta imagem. Se for uma receita médica, fórmula magistral ou bula de medicamento, mantenha a formatação original e inclua todas as informações importantes como dosagens, composições e instruções. Seja preciso e completo.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da OpenAI API:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content || 'Não foi possível extrair texto da imagem.';

    console.log('Texto extraído com sucesso');

    return new Response(
      JSON.stringify({ 
        extractedText,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na função OCR:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
