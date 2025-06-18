
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface APIUsage {
  partner_id: string;
  endpoint: string;
  method: string;
  requests_count: number;
  last_request: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se a API key é válida
    const { data: partner, error: partnerError } = await supabase
      .from('api_partners')
      .select('id, name, status, rate_limit_per_hour')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar rate limiting
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const { data: recentRequests, error: usageError } = await supabase
      .from('api_usage')
      .select('requests_count')
      .eq('partner_id', partner.id)
      .gte('last_request', oneHourAgo.toISOString());

    if (usageError) {
      console.error('Error checking usage:', usageError);
    }

    const totalRequests = recentRequests?.reduce((sum, record) => sum + record.requests_count, 0) || 0;
    
    if (totalRequests >= partner.rate_limit_per_hour) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          limit: partner.rate_limit_per_hour,
          current: totalRequests
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Registrar uso da API
    await supabase
      .from('api_usage')
      .upsert({
        partner_id: partner.id,
        endpoint: new URL(req.url).pathname,
        method: req.method,
        requests_count: 1,
        last_request: now.toISOString()
      }, {
        onConflict: 'partner_id,endpoint,method',
        ignoreDuplicates: false
      });

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/partner-api', '');

    // Roteamento da API
    switch (path) {
      case '/formulas':
        return await handleFormulasAPI(req, supabase, partner);
      
      case '/analyze':
        return await handleAnalysisAPI(req, supabase, partner);
      
      case '/usage':
        return await handleUsageAPI(req, supabase, partner);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

  } catch (error) {
    console.error('Error in partner API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleFormulasAPI(req: Request, supabase: any, partner: any) {
  if (req.method === 'GET') {
    // Listar fórmulas de referência
    const { data: formulas, error } = await supabase
      .from('reference_formulas')
      .select(`
        id,
        name,
        description,
        category,
        specialty,
        pharmaceutical_form,
        reference_formula_actives(
          active_name,
          concentration_mg,
          role_in_formula
        )
      `)
      .limit(100);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch formulas' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        formulas,
        partner: partner.name,
        total: formulas?.length || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleAnalysisAPI(req: Request, supabase: any, partner: any) {
  if (req.method === 'POST') {
    const body = await req.json();
    const { formula, specialty = 'geral' } = body;

    if (!formula) {
      return new Response(
        JSON.stringify({ error: 'Formula is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Chamar função de análise da IA
      const { data: analysis, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Analisar esta fórmula magistral para API de parceiro:\n\n${formula}\n\nFaça uma análise técnica completa incluindo compatibilidade, dosagens e sugestões.`,
          userId: partner.id,
          specialty,
          isPartnerAPI: true
        }
      });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          analysis: analysis.response,
          partner: partner.name,
          specialty,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('Analysis error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze formula' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleUsageAPI(req: Request, supabase: any, partner: any) {
  if (req.method === 'GET') {
    // Retornar estatísticas de uso do parceiro
    const { data: usage, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('partner_id', partner.id)
      .order('last_request', { ascending: false })
      .limit(100);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch usage data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const totalRequests = usage?.reduce((sum, record) => sum + record.requests_count, 0) || 0;

    return new Response(
      JSON.stringify({ 
        partner: partner.name,
        rate_limit: partner.rate_limit_per_hour,
        total_requests: totalRequests,
        recent_usage: usage
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
