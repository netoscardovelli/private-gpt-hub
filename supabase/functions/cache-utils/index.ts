
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, cacheId } = await req.json();

    if (action === 'increment_hit') {
      // Incrementar hit count
      const { data, error } = await supabaseClient
        .from('query_cache')
        .select('hit_count')
        .eq('id', cacheId)
        .single();

      if (error) {
        throw error;
      }

      const { error: updateError } = await supabaseClient
        .from('query_cache')
        .update({
          hit_count: data.hit_count + 1,
          last_hit: new Date().toISOString()
        })
        .eq('id', cacheId);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action not supported' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cache utils error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
