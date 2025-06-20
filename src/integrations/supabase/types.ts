export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_incompatibilities: {
        Row: {
          active_1: string
          active_2: string
          created_at: string
          id: string
          incompatibility_type: string
          notes: string | null
          severity: string
        }
        Insert: {
          active_1: string
          active_2: string
          created_at?: string
          id?: string
          incompatibility_type: string
          notes?: string | null
          severity: string
        }
        Update: {
          active_1?: string
          active_2?: string
          created_at?: string
          id?: string
          incompatibility_type?: string
          notes?: string | null
          severity?: string
        }
        Relationships: []
      }
      analysis_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          organization_id: string | null
          original_analysis: string
          processed: boolean | null
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          organization_id?: string | null
          original_analysis: string
          processed?: boolean | null
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          organization_id?: string | null
          original_analysis?: string
          processed?: boolean | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_partners: {
        Row: {
          api_key: string
          contact_person: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          last_used_at: string | null
          name: string
          organization_id: string | null
          rate_limit_per_hour: number
          status: string
          total_requests: number | null
          updated_at: string
        }
        Insert: {
          api_key?: string
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          last_used_at?: string | null
          name: string
          organization_id?: string | null
          rate_limit_per_hour?: number
          status?: string
          total_requests?: number | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string | null
          rate_limit_per_hour?: number
          status?: string
          total_requests?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_partners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage: {
        Row: {
          endpoint: string
          error_message: string | null
          id: string
          last_request: string
          method: string
          partner_id: string | null
          requests_count: number
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          endpoint: string
          error_message?: string | null
          id?: string
          last_request?: string
          method: string
          partner_id?: string | null
          requests_count?: number
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          endpoint?: string
          error_message?: string | null
          id?: string
          last_request?: string
          method?: string
          partner_id?: string | null
          requests_count?: number
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "api_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      application_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          event: string
          id: string
          level: string
          metadata: Json | null
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          event: string
          id?: string
          level: string
          metadata?: Json | null
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          event?: string
          id?: string
          level?: string
          metadata?: Json | null
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automated_alerts: {
        Row: {
          alert_type: string
          condition_rules: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_triggered: string | null
          organization_id: string
          trigger_count: number
          updated_at: string
        }
        Insert: {
          alert_type: string
          condition_rules: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          organization_id: string
          trigger_count?: number
          updated_at?: string
        }
        Update: {
          alert_type?: string
          condition_rules?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          organization_id?: string
          trigger_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          formula_detected: boolean | null
          id: string
          message_type: string
          response_time_ms: number | null
          session_id: string | null
          specialty: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          formula_detected?: boolean | null
          id?: string
          message_type: string
          response_time_ms?: number | null
          session_id?: string | null
          specialty?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          formula_detected?: boolean | null
          id?: string
          message_type?: string
          response_time_ms?: number | null
          session_id?: string | null
          specialty?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          feedback_rating: number | null
          id: string
          message_count: number | null
          organization_id: string | null
          session_end: string | null
          session_start: string
          specialty: string | null
          total_tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_rating?: number | null
          id?: string
          message_count?: number | null
          organization_id?: string | null
          session_end?: string | null
          session_start?: string
          specialty?: string | null
          total_tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_rating?: number | null
          id?: string
          message_count?: number | null
          organization_id?: string | null
          session_end?: string | null
          session_start?: string
          specialty?: string | null
          total_tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_signatures: {
        Row: {
          certificate_info: Json
          created_at: string
          id: string
          is_valid: boolean | null
          prescription_id: string
          signature_data: string
          signature_type: string
          signer_id: string
          timestamp_data: Json | null
        }
        Insert: {
          certificate_info: Json
          created_at?: string
          id?: string
          is_valid?: boolean | null
          prescription_id: string
          signature_data: string
          signature_type?: string
          signer_id: string
          timestamp_data?: Json | null
        }
        Update: {
          certificate_info?: Json
          created_at?: string
          id?: string
          is_valid?: boolean | null
          prescription_id?: string
          signature_data?: string
          signature_type?: string
          signer_id?: string
          timestamp_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensation_logs: {
        Row: {
          created_at: string
          dispensation_date: string
          dispensed_quantity: number
          id: string
          notes: string | null
          patient_signature: Json | null
          pharmacist_id: string
          pharmacy_id: string
          prescription_id: string
          prescription_item_id: string
        }
        Insert: {
          created_at?: string
          dispensation_date?: string
          dispensed_quantity: number
          id?: string
          notes?: string | null
          patient_signature?: Json | null
          pharmacist_id: string
          pharmacy_id: string
          prescription_id: string
          prescription_item_id: string
        }
        Update: {
          created_at?: string
          dispensation_date?: string
          dispensed_quantity?: number
          id?: string
          notes?: string | null
          patient_signature?: Json | null
          pharmacist_id?: string
          pharmacy_id?: string
          prescription_id?: string
          prescription_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispensation_logs_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensation_logs_prescription_item_id_fkey"
            columns: ["prescription_item_id"]
            isOneToOne: false
            referencedRelation: "prescription_items"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_performance: {
        Row: {
          average_formula_complexity: number | null
          created_at: string
          doctor_id: string
          id: string
          month_year: string
          organization_id: string
          patient_satisfaction: number | null
          specialties_covered: Json | null
          total_prescriptions: number | null
          unique_formulas: number | null
          updated_at: string
        }
        Insert: {
          average_formula_complexity?: number | null
          created_at?: string
          doctor_id: string
          id?: string
          month_year: string
          organization_id: string
          patient_satisfaction?: number | null
          specialties_covered?: Json | null
          total_prescriptions?: number | null
          unique_formulas?: number | null
          updated_at?: string
        }
        Update: {
          average_formula_complexity?: number | null
          created_at?: string
          doctor_id?: string
          id?: string
          month_year?: string
          organization_id?: string
          patient_satisfaction?: number | null
          specialties_covered?: Json | null
          total_prescriptions?: number | null
          unique_formulas?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          concentration_preferences: Json | null
          created_at: string
          experience_level: string | null
          focus_area: string | null
          focus_areas: Json | null
          formulation_preferences: string | null
          formulation_style: string | null
          id: string
          organization_id: string | null
          preferred_actives: Json | null
          preferred_protocols: string | null
          recent_patterns: Json | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          concentration_preferences?: Json | null
          created_at?: string
          experience_level?: string | null
          focus_area?: string | null
          focus_areas?: Json | null
          formulation_preferences?: string | null
          formulation_style?: string | null
          id?: string
          organization_id?: string | null
          preferred_actives?: Json | null
          preferred_protocols?: string | null
          recent_patterns?: Json | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          concentration_preferences?: Json | null
          created_at?: string
          experience_level?: string | null
          focus_area?: string | null
          focus_areas?: Json | null
          formulation_preferences?: string | null
          formulation_style?: string | null
          id?: string
          organization_id?: string | null
          preferred_actives?: Json | null
          preferred_protocols?: string | null
          recent_patterns?: Json | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_metrics: {
        Row: {
          average_formula_value: number | null
          created_at: string
          date: string
          growth_rate: number | null
          id: string
          organization_id: string
          top_category: string | null
          total_formulas: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          average_formula_value?: number | null
          created_at?: string
          date?: string
          growth_rate?: number | null
          id?: string
          organization_id: string
          top_category?: string | null
          total_formulas?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          average_formula_value?: number | null
          created_at?: string
          date?: string
          growth_rate?: number | null
          id?: string
          organization_id?: string
          top_category?: string | null
          total_formulas?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      formula_statistics: {
        Row: {
          average_rating: number | null
          created_at: string
          formula_id: string
          id: string
          month_year: string
          organization_id: string
          prescription_count: number | null
          success_rate: number | null
          total_revenue: number | null
          unique_doctors: number | null
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          formula_id: string
          id?: string
          month_year: string
          organization_id: string
          prescription_count?: number | null
          success_rate?: number | null
          total_revenue?: number | null
          unique_doctors?: number | null
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          formula_id?: string
          id?: string
          month_year?: string
          organization_id?: string
          prescription_count?: number | null
          success_rate?: number | null
          total_revenue?: number | null
          unique_doctors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_url: string | null
          filters: Json | null
          id: string
          organization_id: string
          report_name: string
          report_type: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          organization_id: string
          report_name: string
          report_type: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          organization_id?: string
          report_name?: string
          report_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          error_message: string | null
          id: string
          metadata: Json | null
          notification_id: string | null
          sent_at: string
          status: string
        }
        Insert: {
          channel: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          sent_at?: string
          status: string
        }
        Update: {
          channel?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          frequency: string
          id: string
          incompatibility_alerts: boolean
          organization_id: string | null
          performance_alerts: boolean
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          system_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          frequency?: string
          id?: string
          incompatibility_alerts?: boolean
          organization_id?: string | null
          performance_alerts?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          system_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          frequency?: string
          id?: string
          incompatibility_alerts?: boolean
          organization_id?: string | null
          performance_alerts?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          system_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          organization_id: string
          priority: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          organization_id: string
          priority?: string
          read_at?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string
          priority?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organization_favorite_formulas: {
        Row: {
          added_by: string
          created_at: string
          formula_id: string
          id: string
          organization_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          formula_id: string
          id?: string
          organization_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          formula_id?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_favorite_formulas_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_favorite_formulas_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "reference_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_favorite_formulas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string | null
          description: string | null
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          plan_type: string | null
          slug: string
          stripe_customer_id: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          plan_type?: string | null
          slug: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan_type?: string | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          name: string
          tags: Json | null
          timestamp: string
          unit: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          tags?: Json | null
          timestamp?: string
          unit: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          tags?: Json | null
          timestamp?: string
          unit?: string
          value?: number
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          active_ingredients: Json
          anvisa_code: string | null
          concentration: string
          controlled_substance: boolean | null
          created_at: string
          dosage_instructions: string
          duration_days: number | null
          id: string
          medication_name: string
          pharmaceutical_form: string
          prescription_id: string
          quantity: number
        }
        Insert: {
          active_ingredients: Json
          anvisa_code?: string | null
          concentration: string
          controlled_substance?: boolean | null
          created_at?: string
          dosage_instructions: string
          duration_days?: number | null
          id?: string
          medication_name: string
          pharmaceutical_form: string
          prescription_id: string
          quantity: number
        }
        Update: {
          active_ingredients?: Json
          anvisa_code?: string | null
          concentration?: string
          controlled_substance?: boolean | null
          created_at?: string
          dosage_instructions?: string
          duration_days?: number | null
          id?: string
          medication_name?: string
          pharmaceutical_form?: string
          prescription_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_templates: {
        Row: {
          created_at: string
          created_by: string
          doctor_id: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          specialty: string | null
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          doctor_id?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          specialty?: string | null
          template_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          doctor_id?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          specialty?: string | null
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          clinical_indication: string | null
          controlled_medication: boolean | null
          created_at: string
          digital_signature: Json | null
          doctor_id: string
          id: string
          organization_id: string
          patient_address: Json
          patient_birth_date: string
          patient_cpf: string
          patient_name: string
          pharmacy_id: string | null
          prescription_date: string
          prescription_number: string
          qr_code: string | null
          sngpc_reported: boolean | null
          special_instructions: string | null
          status: string
          updated_at: string
          validity_date: string
        }
        Insert: {
          clinical_indication?: string | null
          controlled_medication?: boolean | null
          created_at?: string
          digital_signature?: Json | null
          doctor_id: string
          id?: string
          organization_id: string
          patient_address: Json
          patient_birth_date: string
          patient_cpf: string
          patient_name: string
          pharmacy_id?: string | null
          prescription_date?: string
          prescription_number: string
          qr_code?: string | null
          sngpc_reported?: boolean | null
          special_instructions?: string | null
          status?: string
          updated_at?: string
          validity_date: string
        }
        Update: {
          clinical_indication?: string | null
          controlled_medication?: boolean | null
          created_at?: string
          digital_signature?: Json | null
          doctor_id?: string
          id?: string
          organization_id?: string
          patient_address?: Json
          patient_birth_date?: string
          patient_cpf?: string
          patient_name?: string
          pharmacy_id?: string | null
          prescription_date?: string
          prescription_number?: string
          qr_code?: string | null
          sngpc_reported?: boolean | null
          special_instructions?: string | null
          status?: string
          updated_at?: string
          validity_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      query_cache: {
        Row: {
          created_at: string | null
          expires_at: string
          hit_count: number | null
          id: string
          last_hit: string | null
          metadata: Json | null
          quality_score: number | null
          query_hash: string
          query_normalized: string
          response: string
          specialty: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          hit_count?: number | null
          id?: string
          last_hit?: string | null
          metadata?: Json | null
          quality_score?: number | null
          query_hash: string
          query_normalized: string
          response: string
          specialty: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          hit_count?: number | null
          id?: string
          last_hit?: string | null
          metadata?: Json | null
          quality_score?: number | null
          query_hash?: string
          query_normalized?: string
          response?: string
          specialty?: string
        }
        Relationships: []
      }
      reference_formula_actives: {
        Row: {
          active_name: string
          concentration_mg: number
          concentration_text: string | null
          created_at: string
          formula_id: string | null
          id: string
          mechanism_notes: string | null
          role_in_formula: string | null
        }
        Insert: {
          active_name: string
          concentration_mg: number
          concentration_text?: string | null
          created_at?: string
          formula_id?: string | null
          id?: string
          mechanism_notes?: string | null
          role_in_formula?: string | null
        }
        Update: {
          active_name?: string
          concentration_mg?: number
          concentration_text?: string | null
          created_at?: string
          formula_id?: string | null
          id?: string
          mechanism_notes?: string | null
          role_in_formula?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reference_formula_actives_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "reference_formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_formulas: {
        Row: {
          capsules_per_dose: number | null
          category: string
          clinical_indication: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          pharmaceutical_form: string
          specialty: string | null
          target_dosage_per_day: number | null
          total_weight_mg: number | null
          updated_at: string
        }
        Insert: {
          capsules_per_dose?: number | null
          category: string
          clinical_indication?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          pharmaceutical_form: string
          specialty?: string | null
          target_dosage_per_day?: number | null
          total_weight_mg?: number | null
          updated_at?: string
        }
        Update: {
          capsules_per_dose?: number | null
          category?: string
          clinical_indication?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          pharmaceutical_form?: string
          specialty?: string | null
          target_dosage_per_day?: number | null
          total_weight_mg?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_formulas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string | null
          plan_name: string
          price_per_month: number | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          plan_name: string
          price_per_month?: number | null
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          plan_name?: string
          price_per_month?: number | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          company_name: string
          created_at: string
          id: string
          logo_url: string | null
          organization_id: string | null
          primary_color: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          logo_url?: string | null
          organization_id?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          organization_id?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_stats: {
        Row: {
          avg_daily: number | null
          created_at: string | null
          date: string
          id: string
          last_query_at: string | null
          organization_id: string | null
          queries_this_month: number | null
          queries_today: number | null
          streak_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_daily?: number | null
          created_at?: string | null
          date?: string
          id?: string
          last_query_at?: string | null
          organization_id?: string | null
          queries_this_month?: number | null
          queries_today?: number | null
          streak_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_daily?: number | null
          created_at?: string | null
          date?: string
          id?: string
          last_query_at?: string | null
          organization_id?: string | null
          queries_this_month?: number | null
          queries_today?: number | null
          streak_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_stats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          id: string
          ip_address: unknown | null
          last_activity: string | null
          metadata: Json | null
          session_id: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          metadata?: Json | null
          session_id: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          metadata?: Json | null
          session_id?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_tiers: {
        Row: {
          cache_access: boolean | null
          created_at: string | null
          daily_limit: number
          id: string
          monthly_limit: number
          organization_id: string | null
          priority_bonus: number | null
          tier_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cache_access?: boolean | null
          created_at?: string | null
          daily_limit?: number
          id?: string
          monthly_limit?: number
          organization_id?: string | null
          priority_bonus?: number | null
          tier_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cache_access?: boolean | null
          created_at?: string | null
          daily_limit?: number
          id?: string
          monthly_limit?: number
          organization_id?: string | null
          priority_bonus?: number | null
          tier_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tiers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_doctor_invitations: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_prescription_number: {
        Args: { org_id: string }
        Returns: string
      }
      validate_cpf: {
        Args: { cpf: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
