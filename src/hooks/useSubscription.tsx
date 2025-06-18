
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string | null;
  status: string;
  plan_name: string;
  price_per_month: number | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  domain: string | null;
  plan_type: string;
  subscription_status: string;
  stripe_customer_id: string | null;
}

export const useSubscription = () => {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.organization_id) {
      loadSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const loadSubscriptionData = async () => {
    if (!profile?.organization_id) return;

    try {
      setLoading(true);

      // Load organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .maybeSingle();

      if (orgError) {
        console.error('Error loading organization:', orgError);
      } else if (orgData) {
        setOrganization(orgData);
      }

      // Load subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();

      if (subError) {
        console.error('Error loading subscription:', subError);
      } else if (subData) {
        setSubscription(subData);
      }

    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da assinatura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          organizationId: profile?.organization_id
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar sessão de pagamento",
        variant: "destructive"
      });
    }
  };

  const createPortalSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          organizationId: profile?.organization_id
        }
      });

      if (error) throw error;

      // Open Stripe portal in a new tab
      window.open(data.url, '_blank');

    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Erro",
        description: "Falha ao abrir portal de assinatura",
        variant: "destructive"
      });
    }
  };

  const cancelSubscription = async () => {
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription?.stripe_subscription_id
        }
      });

      if (error) throw error;

      await loadSubscriptionData();
      
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura será cancelada no final do período"
      });

    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Erro",
        description: "Falha ao cancelar assinatura",
        variant: "destructive"
      });
    }
  };

  return {
    subscription,
    organization,
    loading,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    refreshData: loadSubscriptionData
  };
};
