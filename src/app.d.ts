// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js"

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient
      safeGetSession: () => Promise<{ session: Session | null; user: SupabaseUser | null }>
      session: Session | null
      user: SupabaseUser | null
    }
    interface PageData {}
    interface PageState {}
    interface Platform {}
  }
}

export {}
