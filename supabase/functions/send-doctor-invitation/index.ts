
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
    
    // Usar www.formula-ai.app como domínio principal
    const baseUrl = 'https://www.formula-ai.app';
    const registerUrl = `${baseUrl}/doctors/accept-invitation?token=${invitation.invitation_token}`;
    
    console.log('🔗 URL do convite gerada:', registerUrl);
    console.log('🏢 Organização:', orgName);

    // Configurar domínio do Resend
    const resendDomain = Deno.env.get('RESEND_DOMAIN') || 'formula-ai.app';
    
    // Template do email com conteúdo completo
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite para Parceria - ${orgName}</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f8fafc; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 12px; 
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                margin-top: 20px;
                margin-bottom: 20px;
            }
            .header { 
                background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                color: white; 
                padding: 40px 20px; 
                text-align: center; 
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }
            .content { 
                padding: 40px; 
                color: #374151;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1f2937;
            }
            .invitation-text {
                font-size: 16px;
                margin-bottom: 30px;
                color: #4b5563;
            }
            .cta-container {
                text-align: center;
                margin: 40px 0;
            }
            .cta-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                color: white !important; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 600;
                font-size: 16px;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .details {
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                border-left: 4px solid #10b981;
            }
            .details h3 {
                margin-top: 0;
                color: #1f2937;
                font-size: 18px;
            }
            .details ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .details li {
                margin: 8px 0;
                color: #4b5563;
            }
            .warning {
                background: #fef3c7;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
                font-size: 14px;
                color: #92400e;
            }
            .footer { 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid #e5e7eb; 
                color: #6b7280; 
                font-size: 14px; 
                text-align: center;
            }
            .logo {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">💊 Formula AI</div>
                <h1>🤝 Convite para Parceria Médica</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Olá, Doutor(a)!
                </div>
                
                <div class="invitation-text">
                    Você foi convidado(a) por <strong>${invitedByName}</strong> para se juntar à 
                    <strong>${orgName}</strong> como médico parceiro em nossa plataforma de prescrições magistrais.
                </div>

                <div class="details">
                    <h3>📋 Detalhes do Convite</h3>
                    <ul>
                        <li><strong>Farmácia:</strong> ${orgName}</li>
                        <li><strong>Convidado por:</strong> ${invitedByName}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Válido até:</strong> ${new Date(expiresAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</li>
                    </ul>
                </div>

                <div class="cta-container">
                    <a href="${registerUrl}" class="cta-button">
                        ✨ Aceitar Convite e Cadastrar-se
                    </a>
                </div>

                <div class="warning">
                    <strong>⚠️ Importante:</strong> Este convite é pessoal e intransferível. 
                    O link expira em 7 dias após o envio.
                </div>

                <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                    <h4 style="margin-top: 0; color: #047857;">🎯 Benefícios da Parceria</h4>
                    <ul style="color: #065f46; margin-bottom: 0;">
                        <li>Sistema inteligente de prescrições magistrais</li>
                        <li>Interface moderna e intuitiva</li>
                        <li>Suporte completo para fórmulas personalizadas</li>
                        <li>Integração com a farmácia parceira</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p><strong>Formula AI</strong> - Sistema Inteligente de Prescrições Magistrais</p>
                <p>© 2024 Formula AI. Todos os direitos reservados.</p>
                <p style="font-size: 12px; margin-top: 10px;">
                    Este email foi enviado para ${email}. Se você não solicitou este convite, 
                    pode ignorar este email com segurança.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Texto alternativo para clientes que não suportam HTML
    const emailText = `
CONVITE PARA PARCERIA MÉDICA

Olá, Doutor(a)!

Você foi convidado(a) por ${invitedByName} para se juntar à ${orgName} como médico parceiro em nossa plataforma Formula AI.

DETALHES DO CONVITE:
- Farmácia: ${orgName}
- Convidado por: ${invitedByName}
- Email: ${email}
- Válido até: ${new Date(expiresAt).toLocaleDateString('pt-BR')}

Para aceitar o convite, acesse: ${registerUrl}

BENEFÍCIOS DA PARCERIA:
• Sistema inteligente de prescrições magistrais
• Interface moderna e intuitiva  
• Suporte completo para fórmulas personalizadas
• Integração com a farmácia parceira

IMPORTANTE: Este convite é pessoal e intransferível. O link expira em 7 dias.

---
Formula AI - Sistema Inteligente de Prescrições Magistrais
© 2024 Formula AI. Todos os direitos reservados.

Se você não solicitou este convite, pode ignorar este email com segurança.
    `.trim();

    // Payload do email
    const emailPayload = {
      from: `${orgName} <noreply@${resendDomain}>`,
      to: [email],
      subject: `🤝 Convite para Parceria Médica - ${orgName}`,
      html: emailHtml,
      text: emailText
    };

    console.log('📤 Enviando email com payload completo...');
    console.log('📨 From:', emailPayload.from);
    console.log('📨 To:', emailPayload.to);
    console.log('📨 Subject:', emailPayload.subject);

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
      throw new Error(`Resend API Error: ${emailResponse.status} - ${errorData}`);
    }

    const emailData = await emailResponse.json();
    console.log('✅ Email enviado com sucesso:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData.id,
        message: 'Convite enviado com sucesso!',
        invitationUrl: registerUrl
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
