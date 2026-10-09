export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      career_projects: {
        Row: {
          companies: string
          company_role: string
          created_at: string
          deepened: boolean
          description: string
          extra_info: string
          job_names: string
          job_or_field: string
          news: string
          qualities: string
          sector: string
          updated_at: string
          user_id: string
        }
        Insert: {
          companies?: string
          company_role?: string
          created_at?: string
          deepened?: boolean
          description?: string
          extra_info?: string
          job_names?: string
          job_or_field?: string
          news?: string
          qualities?: string
          sector?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          companies?: string
          company_role?: string
          created_at?: string
          deepened?: boolean
          description?: string
          extra_info?: string
          job_names?: string
          job_or_field?: string
          news?: string
          qualities?: string
          sector?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          ai_feedback: string
          anecdotes: Json
          category: string
          context: string
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
          status: string
          story: string
          story_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string
          anecdotes?: Json
          category: string
          context?: string
          created_at?: string
          end_date?: string
          id?: string
          name: string
          start_date?: string
          status?: string
          story?: string
          story_title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string
          anecdotes?: Json
          category?: string
          context?: string
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          story?: string
          story_title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_evaluations: {
        Row: {
          attempts: number
          case_points: Json
          created_at: string
          criterion_points: Json
          duration_ms: number
          errors: Json
          final_score: number | null
          grille: string
          id: string
          interrupted: boolean
          model: string
          penalties: Json
          percentile: number | null
          raw_output: Json | null
          raw_text: string
          score_20: number | null
          session_id: string
          status: string
          triggered_by: string
          unrated_criteria: Json
          user_id: string
          warnings: Json
        }
        Insert: {
          attempts?: number
          case_points?: Json
          created_at?: string
          criterion_points?: Json
          duration_ms?: number
          errors?: Json
          final_score?: number | null
          grille?: string
          id?: string
          interrupted?: boolean
          model: string
          penalties?: Json
          percentile?: number | null
          raw_output?: Json | null
          raw_text?: string
          score_20?: number | null
          session_id: string
          status: string
          triggered_by?: string
          unrated_criteria?: Json
          user_id: string
          warnings?: Json
        }
        Update: {
          attempts?: number
          case_points?: Json
          created_at?: string
          criterion_points?: Json
          duration_ms?: number
          errors?: Json
          final_score?: number | null
          grille?: string
          id?: string
          interrupted?: boolean
          model?: string
          penalties?: Json
          percentile?: number | null
          raw_output?: Json | null
          raw_text?: string
          score_20?: number | null
          session_id?: string
          status?: string
          triggered_by?: string
          unrated_criteria?: Json
          user_id?: string
          warnings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "interview_evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          created_at: string
          debrief: string
          difficulty: string
          feedback_evaluation_id: string | null
          feedback_source: string | null
          format: string
          id: string
          inseec_image: string
          percentile: number | null
          phase_timings: Json
          school: string
          status: string
          support_label: string
          support_path: string
          support_text: string
          tirages: Json
          turns: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          debrief?: string
          difficulty?: string
          feedback_evaluation_id?: string | null
          feedback_source?: string | null
          format?: string
          id?: string
          inseec_image?: string
          percentile?: number | null
          phase_timings?: Json
          school?: string
          status?: string
          support_label?: string
          support_path?: string
          support_text?: string
          tirages?: Json
          turns?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          debrief?: string
          difficulty?: string
          feedback_evaluation_id?: string | null
          feedback_source?: string | null
          format?: string
          id?: string
          inseec_image?: string
          percentile?: number | null
          phase_timings?: Json
          school?: string
          status?: string
          support_label?: string
          support_path?: string
          support_text?: string
          tirages?: Json
          turns?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_feedback_evaluation_id_fkey"
            columns: ["feedback_evaluation_id"]
            isOneToOne: false
            referencedRelation: "interview_evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_supports: {
        Row: {
          ai_feedback: string
          answers: Json
          created_at: string
          cv: Json
          id: string
          kind: string
          school: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string
          answers?: Json
          created_at?: string
          cv?: Json
          id?: string
          kind?: string
          school: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string
          answers?: Json
          created_at?: string
          cv?: Json
          id?: string
          kind?: string
          school?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news_topics: {
        Row: {
          ai_feedback: string
          causes: string
          consequences: string
          created_at: string
          event_date: string
          id: string
          interview_link: string
          personal_interest: string
          stakes: string
          status: string
          title: string
          updated_at: string
          urls: Json
          user_id: string
          why_important: string
        }
        Insert: {
          ai_feedback?: string
          causes?: string
          consequences?: string
          created_at?: string
          event_date?: string
          id?: string
          interview_link?: string
          personal_interest?: string
          stakes?: string
          status?: string
          title?: string
          updated_at?: string
          urls?: Json
          user_id: string
          why_important?: string
        }
        Update: {
          ai_feedback?: string
          causes?: string
          consequences?: string
          created_at?: string
          event_date?: string
          id?: string
          interview_link?: string
          personal_interest?: string
          stakes?: string
          status?: string
          title?: string
          updated_at?: string
          urls?: Json
          user_id?: string
          why_important?: string
        }
        Relationships: []
      }
      oauth_handoffs: {
        Row: {
          created_at: string
          nonce: string
          refresh_token: string
        }
        Insert: {
          created_at?: string
          nonce: string
          refresh_token: string
        }
        Update: {
          created_at?: string
          nonce?: string
          refresh_token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acquisition_channel: string
          choice_1: string
          choice_2: string
          choice_3: string
          created_at: string
          expectations: string[]
          expectations_other: string
          first_name: string
          full_name: string
          id: string
          last_name: string
          other_prep: string
          part1_completed: boolean
          part2_completed: boolean
          plan: string
          prepa_class: string
          prepa_lycee: string
          target_schools: string[]
          updated_at: string
        }
        Insert: {
          acquisition_channel?: string
          choice_1?: string
          choice_2?: string
          choice_3?: string
          created_at?: string
          expectations?: string[]
          expectations_other?: string
          first_name?: string
          full_name?: string
          id: string
          last_name?: string
          other_prep?: string
          part1_completed?: boolean
          part2_completed?: boolean
          plan?: string
          prepa_class?: string
          prepa_lycee?: string
          target_schools?: string[]
          updated_at?: string
        }
        Update: {
          acquisition_channel?: string
          choice_1?: string
          choice_2?: string
          choice_3?: string
          created_at?: string
          expectations?: string[]
          expectations_other?: string
          first_name?: string
          full_name?: string
          id?: string
          last_name?: string
          other_prep?: string
          part1_completed?: boolean
          part2_completed?: boolean
          plan?: string
          prepa_class?: string
          prepa_lycee?: string
          target_schools?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      question_answers: {
        Row: {
          ai_feedback: string
          answer: string
          created_at: string
          id: string
          question_id: string
          school: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string
          answer?: string
          created_at?: string
          id?: string
          question_id: string
          school?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string
          answer?: string
          created_at?: string
          id?: string
          question_id?: string
          school?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          ai_feedback: string
          answer: string
          created_at: string
          id: string
          question_id: string
          school: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string
          answer?: string
          created_at?: string
          id?: string
          question_id: string
          school?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string
          answer?: string
          created_at?: string
          id?: string
          question_id?: string
          school?: string
          user_id?: string
        }
        Relationships: []
      }
      school_sheets: {
        Row: {
          associations: string
          baseline: string
          campuses: string
          created_at: string
          director: string
          exchanges: string
          finished: boolean
          founded_year: string
          generic_other: string
          id: string
          items: Json
          master_url: string
          masters: string
          partners: string
          school: string
          specifics: string
          updated_at: string
          user_id: string
          why_association: string
          why_exchange: string
          why_master: string
          why_partner: string
          why_specific: string
        }
        Insert: {
          associations?: string
          baseline?: string
          campuses?: string
          created_at?: string
          director?: string
          exchanges?: string
          finished?: boolean
          founded_year?: string
          generic_other?: string
          id?: string
          items?: Json
          master_url?: string
          masters?: string
          partners?: string
          school: string
          specifics?: string
          updated_at?: string
          user_id: string
          why_association?: string
          why_exchange?: string
          why_master?: string
          why_partner?: string
          why_specific?: string
        }
        Update: {
          associations?: string
          baseline?: string
          campuses?: string
          created_at?: string
          director?: string
          exchanges?: string
          finished?: boolean
          founded_year?: string
          generic_other?: string
          id?: string
          items?: Json
          master_url?: string
          masters?: string
          partners?: string
          school?: string
          specifics?: string
          updated_at?: string
          user_id?: string
          why_association?: string
          why_exchange?: string
          why_master?: string
          why_partner?: string
          why_specific?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_oauth_handoff: { Args: { p_nonce: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      put_oauth_handoff: {
        Args: { p_nonce: string; p_refresh_token: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
