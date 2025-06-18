
export interface APIPartner {
  id: string;
  name: string;
  description?: string;
  contact_person?: string;
  email: string;
  organization_id?: string;
  api_key: string;
  status: 'active' | 'inactive' | 'suspended';
  rate_limit_per_hour: number;
  total_requests: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface APIUsage {
  id: string;
  partner_id?: string;
  endpoint: string;
  method: string;
  requests_count: number;
  response_time_ms?: number;
  status_code?: number;
  error_message?: string;
  last_request: string;
}

export interface APICache {
  id: string;
  cache_key: string;
  endpoint: string;
  method: string;
  request_params?: Record<string, any>;
  response_data: any;
  expires_at: string;
  hit_count: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfig {
  id: string;
  organization_id: string;
  service_name: string;
  config_data: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
