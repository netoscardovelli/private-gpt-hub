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
          original_analysis: string
          processed: boolean | null
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          original_analysis: string
          processed?: boolean | null
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          original_analysis?: string
          processed?: boolean | null
          rating?: number | null
          user_id?: string
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
          preferred_actives?: Json | null
          preferred_protocols?: string | null
          recent_patterns?: Json | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
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
          pharmaceutical_form?: string
          specialty?: string | null
          target_dosage_per_day?: number | null
          total_weight_mg?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
