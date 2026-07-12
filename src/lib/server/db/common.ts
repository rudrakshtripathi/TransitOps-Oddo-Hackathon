import { error } from "@sveltejs/kit"

/**
 * Guard Function to check for Auth, otherwise throw 403 Forbidden
 */
export function requireAuth({ user, session, supabase }: App.Locals) {
  if (!user) {
    console.error("Oh current user is non-existent, return")
    error(403, "Forbidden")
  }

  if (!session) {
    console.error("Oh current session is non-existent, return")
    error(403, "Forbidden")
  }

  return { user, session, supabase }
}

export function handleDbError(e: unknown): { data: null; error: string } {
  if (e instanceof Error) {
    console.error(e)
    return { data: null, error: e.message }
  }

  console.error(e)
  return { data: null, error: "An unknown error has occurred" }
}

/* The holy drizzle db */
export { db } from "./index"
