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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          completed_actions: number | null
          created_at: string | null
          credits_allocated: number
          credits_spent: number | null
          id: string
          status: Database["public"]["Enums"]["campaign_status"]
          target_actions: number
          title: string
          updated_at: string | null
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          completed_actions?: number | null
          created_at?: string | null
          credits_allocated: number
          credits_spent?: number | null
          id?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_actions: number
          title: string
          updated_at?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          completed_actions?: number | null
          created_at?: string | null
          credits_allocated?: number
          credits_spent?: number | null
          id?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_actions?: number
          title?: string
          updated_at?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_by: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_by?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_by?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          device_fingerprint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          risk_score: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          device_fingerprint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          risk_score?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          device_fingerprint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          risk_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          assigned_to: string | null
          auto_flagged: boolean | null
          content_id: string
          content_type: string
          created_at: string | null
          flag_reasons: Json | null
          id: string
          notes: string | null
          priority: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          auto_flagged?: boolean | null
          content_id: string
          content_type: string
          created_at?: string | null
          flag_reasons?: Json | null
          id?: string
          notes?: string | null
          priority?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          auto_flagged?: boolean | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          flag_reasons?: Json | null
          id?: string
          notes?: string | null
          priority?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits: number
          full_name: string | null
          id: string
          last_login_date: string | null
          level: number
          preferences: Json | null
          referral_code: string
          referred_by: string | null
          streak_count: number
          updated_at: string
          username: string | null
          xp: number
          youtube_channel: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          full_name?: string | null
          id: string
          last_login_date?: string | null
          level?: number
          preferences?: Json | null
          referral_code?: string
          referred_by?: string | null
          streak_count?: number
          updated_at?: string
          username?: string | null
          xp?: number
          youtube_channel?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          full_name?: string | null
          id?: string
          last_login_date?: string | null
          level?: number
          preferences?: Json | null
          referral_code?: string
          referred_by?: string | null
          streak_count?: number
          updated_at?: string
          username?: string | null
          xp?: number
          youtube_channel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          bonus_awarded: number
          created_at: string
          id: string
          referee_id: string
          referral_code: string
          referrer_id: string
        }
        Insert: {
          bonus_awarded?: number
          created_at?: string
          id?: string
          referee_id: string
          referral_code: string
          referrer_id: string
        }
        Update: {
          bonus_awarded?: number
          created_at?: string
          id?: string
          referee_id?: string
          referral_code?: string
          referrer_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          created_by: string | null
          credits_reward: number
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          credits_reward?: number
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          credits_reward?: number
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          appeal_reviewed_at: string | null
          appeal_reviewed_by: string | null
          appeal_status: string | null
          appeal_text: string | null
          ban_type: string
          banned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          reason: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appeal_reviewed_at?: string | null
          appeal_reviewed_by?: string | null
          appeal_status?: string | null
          appeal_text?: string | null
          ban_type?: string
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appeal_reviewed_at?: string | null
          appeal_reviewed_by?: string | null
          appeal_status?: string | null
          appeal_text?: string | null
          ban_type?: string
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          credits_earned: number | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          credits_earned?: number | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          credits_earned?: number | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          channel_name: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          youtube_id: string
        }
        Insert: {
          channel_name: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          youtube_id: string
        }
        Update: {
          channel_name?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          youtube_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          credit_amount: number
          description?: string
          reference_id?: string
          target_user_id: string
          transaction_type: string
        }
        Returns: undefined
      }
      auto_flag_content: {
        Args: { p_content_id: string; p_content_type: string; p_reasons: Json }
        Returns: string
      }
      check_user_banned: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      complete_task: {
        Args: { p_task_id: string; p_user_id: string }
        Returns: boolean
      }
      create_campaign: {
        Args: {
          p_credits_allocated: number
          p_target_actions: number
          p_title: string
          p_user_id: string
          p_video_id: string
        }
        Returns: string
      }
      detect_fraud_patterns: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      log_fraud_event: {
        Args: {
          p_details: Json
          p_device_fingerprint: string
          p_event_type: string
          p_ip_address: unknown
          p_user_id: string
        }
        Returns: undefined
      }
      update_user_level: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verify_task_completion: {
        Args: {
          p_task_id: string
          p_task_type: string
          p_user_id: string
          p_video_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      campaign_status: "active" | "paused" | "completed" | "cancelled"
      task_status: "pending" | "in_progress" | "completed" | "failed"
      task_type: "watch" | "like" | "subscribe"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      campaign_status: ["active", "paused", "completed", "cancelled"],
      task_status: ["pending", "in_progress", "completed", "failed"],
      task_type: ["watch", "like", "subscribe"],
    },
  },
} as const
