
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  invitationId: string;
  email: string;
  organizationName: string;
  invitedByName: string;
  expiresAt: string;
}

serve(async (req) => {
  console.log('🚀 Edge Function iniciada - send-doctor-invitation');
  console.log('📋 Variáveis de ambiente disponíveis:', {
    hasResendKey: !!Deno.env.get('RESEND_API_KEY'),
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    resendDomain: Deno.env.get('RESEND_DOMAIN') || 'NÃO CONFIGURADO',
    siteUrl: Deno.env.get('SITE_URL') || 'NÃO CONFIGURADO'
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verificar se a RESEND_API_KEY está configurada
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY não configurada');
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY não configurada no servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { invitationId, email, organizationName, invitedByName, expiresAt }: EmailRequest = await req.json();
    
    console.log('📧 Enviando convite para:', { email, organizationName, invitedByName });

    // Criar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados completos do convite
    const { data: invitation, error: inviteError } = await supabase
      .from('doctor_invitations')
      .select('*, organization:organizations(name, slug)')
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      console.error('❌ Erro ao buscar convite:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Convite não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orgName = invitation.organization?.name || organizationName;
    
    // Usar a URL da variável de ambiente ou o Lovable preview URL como fallback
    const baseUrl = Deno.env.get('SITE_URL') || 'https://preview--private-gpt-hub.lovable.app';
    const registerUrl = `${baseUrl}/doctors/accept-invitation?token=${invitation.invitation_token}`;
    
    console.log('🔗 URL do convite:', registerUrl);

    // Configurar domínio do Resend
    const resendDomain = Deno.env.get('RESEND_DOMAIN') || 'onboarding.resend.dev';
    console.log('📬 Configuração do email:', {
      domain: resendDomain,
      from: `${orgName} <noreply@${resendDomain}>`,
      to: email
    });

    // Template do email
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite para Parceria - ${orgName}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤝 Convite para Parceria</h1>
            </div>
            
            <div class="content">
                <p>Olá!</p>
                
                <p>Você foi convidado(a) por <strong>${invitedByName}</strong> para se juntar à <strong>${orgName}</strong> como médico parceiro.</p>
                
                <p style="text-align: center;">
                    <a href="${registerUrl}" class="button">
                        ✨ Aceitar Convite
                    </a>
                </p>

                <p><strong>Detalhes:</strong></p>
                <ul>
                    <li><strong>Farmácia:</strong> ${orgName}</li>
                    <li><strong>Convidado por:</strong> ${invitedByName}</li>
                    <li><strong>Válido até:</strong> ${new Date(expiresAt).toLocaleDateString('pt-BR')}</li>
                </ul>

                <p><small>Este convite é pessoal e intransferível.</small></p>
            </div>

            <div class="footer">
                <p>© 2024 Sistema de Prescrições Magistrais</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Payload do email
    const emailPayload = {
      from: `${orgName} <noreply@${resendDomain}>`,
      to: [email],
      subject: `🤝 Convite para parceria - ${orgName}`,
      html: emailHtml,
      text: `
Olá!

Você foi convidado(a) por ${invitedByName} para se juntar à ${orgName} como médico parceiro.

Para aceitar o convite, acesse: ${registerUrl}

Este convite é válido até ${new Date(expiresAt).toLocaleDateString('pt-BR')}.

Atenciosamente,
${invitedByName}
      `.trim()
    };

    console.log('📤 Enviando email com payload:', JSON.stringify(emailPayload, null, 2));

    // Enviar email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('📊 Resposta do Resend - Status:', emailResponse.status);
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('❌ Erro do Resend:', errorData);
      console.error('📋 Headers da resposta:', Object.fromEntries(emailResponse.headers.entries()));
      throw new Error(`Resend API Error: ${emailResponse.status} - ${errorData}`);
    }

    const emailData = await emailResponse.json();
    console.log('✅ Email enviado com sucesso:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData.id,
        message: 'Convite enviado com sucesso!' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Erro no envio do email:', error);
    console.error('📋 Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
