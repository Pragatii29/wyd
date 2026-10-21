// Generated from Supabase project pvgcvtrynwmcjzbytanv (public schema). Do not edit by hand.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_members: {
        Row: { chat_id: string; user_id: string }
        Insert: { chat_id: string; user_id: string }
        Update: { chat_id?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "chat_members_chat_id_fkey"; columns: ["chat_id"]; isOneToOne: false; referencedRelation: "chats"; referencedColumns: ["id"] },
          { foreignKeyName: "chat_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      chats: {
        Row: { created_at: string; created_by: string; id: string; is_group: boolean; thread_id: string | null }
        Insert: { created_at?: string; created_by: string; id?: string; is_group?: boolean; thread_id?: string | null }
        Update: { created_at?: string; created_by?: string; id?: string; is_group?: boolean; thread_id?: string | null }
        Relationships: [
          { foreignKeyName: "chats_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "chats_thread_id_fkey"; columns: ["thread_id"]; isOneToOne: false; referencedRelation: "threads"; referencedColumns: ["id"] },
        ]
      }
      messages: {
        Row: { body: string; chat_id: string; created_at: string; id: string; sender_id: string }
        Insert: { body: string; chat_id: string; created_at?: string; id?: string; sender_id: string }
        Update: { body?: string; chat_id?: string; created_at?: string; id?: string; sender_id?: string }
        Relationships: [
          { foreignKeyName: "messages_chat_id_fkey"; columns: ["chat_id"]; isOneToOne: false; referencedRelation: "chats"; referencedColumns: ["id"] },
          { foreignKeyName: "messages_sender_id_fkey"; columns: ["sender_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      notifications: {
        Row: { body: string; read: boolean; sent_at: string; thread_id: string; title: string; user_id: string }
        Insert: { body: string; read?: boolean; sent_at?: string; thread_id: string; title: string; user_id: string }
        Update: { body?: string; read?: boolean; sent_at?: string; thread_id?: string; title?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "notifications_thread_id_fkey"; columns: ["thread_id"]; isOneToOne: false; referencedRelation: "threads"; referencedColumns: ["id"] },
          { foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      profiles: {
        Row: {
          area: string
          bio: string | null
          city: string
          created_at: string
          dob: string
          gender: Database["public"]["Enums"]["gender_t"]
          id: string
          interests: string[]
          lat: number | null
          lng: number | null
          name: string
          photo_check: Json | null
          photo_url: string
          social_url: string
          status: Database["public"]["Enums"]["profile_status_t"]
        }
        Insert: {
          area: string
          bio?: string | null
          city?: string
          created_at?: string
          dob: string
          gender: Database["public"]["Enums"]["gender_t"]
          id: string
          interests?: string[]
          lat?: number | null
          lng?: number | null
          name: string
          photo_check?: Json | null
          photo_url: string
          social_url: string
          status?: Database["public"]["Enums"]["profile_status_t"]
        }
        Update: {
          area?: string
          bio?: string | null
          city?: string
          created_at?: string
          dob?: string
          gender?: Database["public"]["Enums"]["gender_t"]
          id?: string
          interests?: string[]
          lat?: number | null
          lng?: number | null
          name?: string
          photo_check?: Json | null
          photo_url?: string
          social_url?: string
          status?: Database["public"]["Enums"]["profile_status_t"]
        }
        Relationships: []
      }
      reports: {
        Row: { created_at: string; id: string; reason: string | null; reporter_id: string; target_id: string; target_type: string }
        Insert: { created_at?: string; id?: string; reason?: string | null; reporter_id: string; target_id: string; target_type: string }
        Update: { created_at?: string; id?: string; reason?: string | null; reporter_id?: string; target_id?: string; target_type?: string }
        Relationships: [
          { foreignKeyName: "reports_reporter_id_fkey"; columns: ["reporter_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      requests: {
        Row: { created_at: string; id: string; requester_id: string; status: Database["public"]["Enums"]["request_status_t"]; thread_id: string }
        Insert: { created_at?: string; id?: string; requester_id: string; status?: Database["public"]["Enums"]["request_status_t"]; thread_id: string }
        Update: { created_at?: string; id?: string; requester_id?: string; status?: Database["public"]["Enums"]["request_status_t"]; thread_id?: string }
        Relationships: [
          { foreignKeyName: "requests_requester_id_fkey"; columns: ["requester_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "requests_thread_id_fkey"; columns: ["thread_id"]; isOneToOne: false; referencedRelation: "threads"; referencedColumns: ["id"] },
        ]
      }
      threads: {
        Row: {
          area: string
          audience: Database["public"]["Enums"]["audience_t"]
          author_id: string
          body: string
          city: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          moderation_reason: string | null
          status: Database["public"]["Enums"]["thread_status_t"]
          tags: string[]
        }
        Insert: {
          area: string
          audience?: Database["public"]["Enums"]["audience_t"]
          author_id: string
          body: string
          city: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          moderation_reason?: string | null
          status: Database["public"]["Enums"]["thread_status_t"]
          tags?: string[]
        }
        Update: {
          area?: string
          audience?: Database["public"]["Enums"]["audience_t"]
          author_id?: string
          body?: string
          city?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          moderation_reason?: string | null
          status?: Database["public"]["Enums"]["thread_status_t"]
          tags?: string[]
        }
        Relationships: [
          { foreignKeyName: "threads_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_users: {
        Args: { p_thread: string }
        Returns: { user_id: string }[]
      }
    }
    Enums: {
      audience_t: "all" | "women" | "men"
      gender_t: "female" | "male"
      profile_status_t: "pending" | "approved" | "rejected" | "suspended"
      request_status_t: "pending" | "accepted" | "declined"
      thread_status_t: "live" | "review" | "blocked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      audience_t: ["all", "women", "men"],
      gender_t: ["female", "male"],
      profile_status_t: ["pending", "approved", "rejected", "suspended"],
      request_status_t: ["pending", "accepted", "declined"],
      thread_status_t: ["live", "review", "blocked"],
    },
  },
} as const
