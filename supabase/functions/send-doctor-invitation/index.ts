
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') ?? '',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface EmailRequest {
  invitationId: string;
  email: string;
  organizationName: string;
  invitedByName: string;
  expiresAt: string;
}

interface OrganizationData {
  name: string;
  slug: string;
}

interface InvitationData {
  id: string;
  invitation_token: string;
  organization?: OrganizationData;
}

// Configuração de constantes
const RESEND_API_URL = 'https://api.resend.com/emails';
const BASE_URL = 'https://www.formula-ai.app';
const DEFAULT_RESEND_DOMAIN = 'formula-ai.app';

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para formatar data
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('⚠️ Erro ao formatar data:', error);
    return 'Data inválida';
  }
}

// Função para gerar template HTML
function generateEmailHTML(
  orgName: string,
  invitedByName: string,
  email: string,
  expiresAt: string,
  registerUrl: string
): string {
  return `
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
            margin: 20px auto;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0,0,0,0.15);
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
        .benefits {
            margin-top: 30px;
            padding: 20px;
            background: #f0fdf4;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        .benefits h4 {
            margin-top: 0;
            color: #047857;
        }
        .benefits ul {
            color: #065f46;
            margin-bottom: 0;
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
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 20px; }
            .header { padding: 30px 20px; }
            .cta-button { padding: 14px 24px; font-size: 14px; }
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
                    <li><strong>Válido até:</strong> ${formatDate(expiresAt)}</li>
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

            <div class="benefits">
                <h4>🎯 Benefícios da Parceria</h4>
                <ul>
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
}

// Função para gerar template de texto
function generateEmailText(
  orgName: string,
  invitedByName: string,
  email: string,
  expiresAt: string,
  registerUrl: string
): string {
  return `
CONVITE PARA PARCERIA MÉDICA

Olá, Doutor(a)!

Você foi convidado(a) por ${invitedByName} para se juntar à ${orgName} como médico parceiro em nossa plataforma Formula AI.

DETALHES DO CONVITE:
- Farmácia: ${orgName}
- Convidado por: ${invitedByName}
- Email: ${email}
- Válido até: ${formatDate(expiresAt)}

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
}

// Função principal
serve(async (req) => {

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 200
    });
  }

  // Verificar método HTTP
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Verificar variáveis de ambiente
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração de email não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis do Supabase não configuradas');
      return new Response(
        JSON.stringify({ error: 'Configuração do banco de dados não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar e extrair dados do request
    let requestData: EmailRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('❌ Erro ao parsear JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Dados inválidos no corpo da requisição' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { invitationId, email, organizationName, invitedByName, expiresAt } = requestData;

    // Validar campos obrigatórios
    if (!invitationId || !email || !organizationName || !invitedByName || !expiresAt) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios faltando',
          required: ['invitationId', 'email', 'organizationName', 'invitedByName', 'expiresAt']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar data de expiração
    const expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'Data de expiração inválida ou já passou' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Criar Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados completos do convite
    const { data: invitation, error: inviteError } = await supabase
      .from('doctor_invitations')
      .select('*, organization:organizations(name, slug)')
      .eq('id', invitationId)
      .single();

    if (inviteError) {
      console.error('❌ Erro ao buscar convite:', inviteError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao acessar dados do convite',
          details: inviteError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invitation) {
      return new Response(
        JSON.stringify({ error: 'Convite não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orgName = invitation.organization?.name || organizationName;
    const registerUrl = `${BASE_URL}/doctors/accept-invitation?token=${invitation.invitation_token}`;


    // Configurar domínio do Resend
    const resendDomain = Deno.env.get('RESEND_DOMAIN') || DEFAULT_RESEND_DOMAIN;

    // Gerar templates
    const emailHtml = generateEmailHTML(orgName, invitedByName, email, expiresAt, registerUrl);
    const emailText = generateEmailText(orgName, invitedByName, email, expiresAt, registerUrl);

    // Payload do email
    const emailPayload = {
      from: `${orgName} <noreply@${resendDomain}>`,
      to: [email],
      subject: `🤝 Convite para Parceria Médica - ${orgName}`,
      html: emailHtml,
      text: emailText,
      // Headers adicionais para melhor deliverabilidade
      headers: {
        'X-Entity-Ref-ID': invitationId,
        'List-Unsubscribe': `<${BASE_URL}/unsubscribe>`,
      }
    };


    // Enviar email via Resend com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    const emailResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);


    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('❌ Erro do Resend:', errorText);
      
      let errorMessage = 'Erro no serviço de email';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Manter mensagem padrão se não conseguir parsear
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: emailResponse.status 
        }),
        { 
          status: emailResponse.status >= 500 ? 500 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const emailData = await emailResponse.json();

    // Opcional: Atualizar status do convite no banco
    try {
      await supabase
        .from('doctor_invitations')
        .update({ 
          email_sent_at: new Date().toISOString(),
          email_id: emailData.id 
        })
        .eq('id', invitationId);
    } catch (updateError) {
      console.warn('⚠️ Erro ao atualizar status do convite:', updateError);
      // Não retorna erro pois o email foi enviado com sucesso
    }

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

    // Diferentes tipos de erro
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = 'Timeout no envio do email';
      statusCode = 408;
    } else if (error.message?.includes('network')) {
      errorMessage = 'Erro de conexão';
      statusCode = 503;
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
