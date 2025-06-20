
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
    const baseUrl = Deno.env.get('SITE_URL') || 'https://app.farmaciamagistral.com';
    const registerUrl = `${baseUrl}/doctors/accept-invitation?token=${invitation.invitation_token}`;

    // Template do email
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite para Parceria - ${orgName}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
            .message { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .cta-button:hover { background: #059669; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .details h3 { margin: 0 0 10px 0; color: #1f2937; }
            .footer { background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤝 Convite para Parceria</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Olá, Doutor(a)! 👋
                </div>
                
                <div class="message">
                    <p>Você foi convidado(a) por <strong>${invitedByName}</strong> para se juntar à <strong>${orgName}</strong> como médico parceiro em nossa plataforma de prescrições magistrais.</p>
                    
                    <p>Nossa parceria oferece:</p>
                    <ul>
                        <li>🔬 Sistema inteligente de formulações</li>
                        <li>📋 Prescrições digitais seguras</li>
                        <li>🤖 Assistente AI especializado</li>
                        <li>📊 Relatórios detalhados</li>
                        <li>🔒 Segurança e conformidade total</li>
                    </ul>
                </div>

                <div style="text-align: center;">
                    <a href="${registerUrl}" class="cta-button">
                        ✨ Aceitar Convite e Cadastrar
                    </a>
                </div>

                <div class="details">
                    <h3>📋 Detalhes do Convite</h3>
                    <p><strong>Farmácia:</strong> ${orgName}</p>
                    <p><strong>Convidado por:</strong> ${invitedByName}</p>
                    <p><strong>Válido até:</strong> ${new Date(expiresAt).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>

                <div class="divider"></div>

                <div style="color: #6b7280; font-size: 14px;">
                    <p><strong>📞 Precisa de ajuda?</strong></p>
                    <p>Entre em contato com nossa equipe de suporte ou diretamente com ${invitedByName} da ${orgName}.</p>
                    <p><em>Este convite é pessoal e intransferível. Válido por 7 dias.</em></p>
                </div>
            </div>

            <div class="footer">
                <p>© 2024 Sistema de Prescrições Magistrais</p>
                <p>Enviado com segurança e carinho 💚</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Enviar email via Resend
    const resendDomain = Deno.env.get('RESEND_DOMAIN') || 'onboarding.resend.dev';
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${orgName} <noreply@${resendDomain}>`,
        to: [email],
        subject: `🤝 Convite para parceria - ${orgName}`,
        html: emailHtml,
        text: `
Olá!

Você foi convidado(a) por ${invitedByName} para se juntar à ${orgName} como médico parceiro.

Para aceitar o convite e se cadastrar, acesse: ${registerUrl}

Este convite é válido até ${new Date(expiresAt).toLocaleDateString('pt-BR')}.

Atenciosamente,
Equipe ${orgName}
        `.trim()
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('❌ Erro do Resend:', errorData);
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
