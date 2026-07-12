import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { createServerClient } from "@supabase/ssr"
import { redirect, type Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return event.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: "/" }))
      },
    },
  })

  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    if (!session) return { session: null, user: null }
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()
    if (error) return { session: null, user: null }
    return { session, user }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version"
    },
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  if (!session && event.url.pathname.startsWith("/app")) {
    // Sanitize redirectTo: must be a relative path starting with / but not //
    const raw = event.url.pathname
    const safePath = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app"
    redirect(303, `/auth?redirectTo=${encodeURIComponent(safePath)}`)
  }

  if (session && event.url.pathname.startsWith("/auth")) {
    redirect(303, "/app")
  }

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard)
