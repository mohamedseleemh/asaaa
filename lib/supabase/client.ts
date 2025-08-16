import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key"

// Check if we're in development mode without Supabase
const isDevelopmentWithoutSupabase =
  process.env.NODE_ENV === "development" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (!isDevelopmentWithoutSupabase && (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co")) {
  console.warn("Supabase not configured. Running in offline mode.")
}

const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: null, error: { code: "OFFLINE_MODE", message: "Supabase not configured" } }),
    insert: () => ({ data: null, error: { code: "OFFLINE_MODE", message: "Supabase not configured" } }),
    update: () => ({ data: null, error: { code: "OFFLINE_MODE", message: "Supabase not configured" } }),
    upsert: () => ({ data: null, error: { code: "OFFLINE_MODE", message: "Supabase not configured" } }),
    delete: () => ({ data: null, error: { code: "OFFLINE_MODE", message: "Supabase not configured" } }),
    eq: function () {
      return this
    },
    single: function () {
      return this
    },
    order: function () {
      return this
    },
    limit: function () {
      return this
    },
    gte: function () {
      return this
    },
  }),
  auth: {
    signIn: () => ({ data: null, error: { message: "Supabase not configured" } }),
    signUp: () => ({ data: null, error: { message: "Supabase not configured" } }),
    signOut: () => ({ error: null }),
    getUser: () => ({ data: { user: null }, error: null }),
  },
})

// Public client for client-side operations
export const supabase = isDevelopmentWithoutSupabase
  ? (createMockClient() as any)
  : createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = isDevelopmentWithoutSupabase
  ? (createMockClient() as any)
  : createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

// Database types
export type Database = {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string
          key: string
          value: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          name: string
          email_hash: string | null
          rating: number
          comment: string
          status: "pending" | "approved" | "rejected"
          ip_address: string | null
          user_agent: string | null
          created_at: string
          moderated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email_hash?: string | null
          rating: number
          comment: string
          status?: "pending" | "approved" | "rejected"
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          moderated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email_hash?: string | null
          rating?: number
          comment?: string
          status?: "pending" | "approved" | "rejected"
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          moderated_at?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          page: string | null
          user_agent: string | null
          ip_address: string | null
          metadata: any | null
          timestamp: string
        }
        Insert: {
          id?: string
          event_type: string
          page?: string | null
          user_agent?: string | null
          ip_address?: string | null
          metadata?: any | null
          timestamp?: string
        }
        Update: {
          id?: string
          event_type?: string
          page?: string | null
          user_agent?: string | null
          ip_address?: string | null
          metadata?: any | null
          timestamp?: string
        }
      }
      content_snapshots: {
        Row: {
          id: string
          content: any
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: any
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: any
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}

export function createServerClient() {
  if (isDevelopmentWithoutSupabase) {
    return createMockClient() as any
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
