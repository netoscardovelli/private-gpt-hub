
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') ?? '',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify webhook signature (simplified - in production use proper verification)
    const event = JSON.parse(body)


    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseClient)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseClient)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseClient)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabaseClient)
        break
      
      default:
        // unhandled event
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  const organizationId = session.metadata.organization_id
  
  // Update organization with Stripe customer ID
  await supabaseClient
    .from('organizations')
    .update({
      stripe_customer_id: session.customer,
      subscription_status: 'active'
    })
    .eq('id', organizationId)

  // Create subscription record
  await supabaseClient
    .from('subscriptions')
    .insert({
      organization_id: organizationId,
      stripe_subscription_id: session.subscription,
      status: 'active',
      plan_name: 'pro', // You might want to get this from the price ID
      price_per_month: session.amount_total / 100
    })
}

async function handleSubscriptionUpdated(subscription: any, supabaseClient: any) {
  await supabaseClient
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  await supabaseClient
    .from('subscriptions')
    .update({
      status: 'canceled'
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  // Update subscription status and period
  await supabaseClient
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(invoice.period_start * 1000).toISOString(),
      current_period_end: new Date(invoice.period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription)
}
