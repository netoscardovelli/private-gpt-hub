// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://graumqipaeijtrnldhpq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYXVtcWlwYWVpanRybmxkaHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDkzMzUsImV4cCI6MjA2NTQyNTMzNX0.pan6g_v-RKsu98BXjdlvDXWZsb3QnfMLyjLM1S5k_x8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);