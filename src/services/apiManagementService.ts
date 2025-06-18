
import { supabase } from '@/integrations/supabase/client';
import type { APIPartner, APIUsage, APICache, IntegrationConfig } from '@/types/api';

// API Partners Management
export const fetchAPIPartnersApi = async (): Promise<APIPartner[]> => {
  const { data, error } = await supabase
    .from('api_partners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as APIPartner[];
};

export const createAPIPartnerApi = async (
  partner: Omit<APIPartner, 'id' | 'api_key' | 'total_requests' | 'created_at' | 'updated_at'>
): Promise<APIPartner> => {
  const { data, error } = await supabase
    .from('api_partners')
    .insert(partner)
    .select()
    .single();

  if (error) throw error;
  return data as APIPartner;
};

export const updateAPIPartnerApi = async (
  id: string,
  updates: Partial<APIPartner>
): Promise<APIPartner> => {
  const { data, error } = await supabase
    .from('api_partners')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as APIPartner;
};

export const deleteAPIPartnerApi = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('api_partners')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// API Usage Analytics
export const fetchAPIUsageApi = async (
  partnerId?: string,
  limit: number = 100
): Promise<APIUsage[]> => {
  let query = supabase
    .from('api_usage')
    .select('*')
    .order('last_request', { ascending: false })
    .limit(limit);

  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as APIUsage[];
};

// API Cache Management
export const fetchAPICacheApi = async (): Promise<APICache[]> => {
  const { data, error } = await supabase
    .from('api_cache')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data || []) as APICache[];
};

export const clearExpiredCacheApi = async (): Promise<void> => {
  const { error } = await supabase.rpc('cleanup_expired_cache');
  if (error) throw error;
};

// Integration Configurations
export const fetchIntegrationConfigsApi = async (
  organizationId: string
): Promise<IntegrationConfig[]> => {
  const { data, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as IntegrationConfig[];
};

export const createIntegrationConfigApi = async (
  config: Omit<IntegrationConfig, 'id' | 'created_at' | 'updated_at'>
): Promise<IntegrationConfig> => {
  const { data, error } = await supabase
    .from('integration_configs')
    .insert(config)
    .select()
    .single();

  if (error) throw error;
  return data as IntegrationConfig;
};

export const updateIntegrationConfigApi = async (
  id: string,
  updates: Partial<IntegrationConfig>
): Promise<IntegrationConfig> => {
  const { data, error } = await supabase
    .from('integration_configs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as IntegrationConfig;
};
