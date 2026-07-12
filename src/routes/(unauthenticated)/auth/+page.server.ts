import { error, fail, redirect } from "@sveltejs/kit"
import { UserRole } from "$lib/constants"
import { getUserByEmail as getUserByEmailDb, createUser as createUserDb } from "$lib/server/db/user"
import * as v from "valibot"
import type { Actions } from "./$types"

export const actions: Actions = {
  login: async ({ request, locals: { supabase }, url }) => {
    console.time("LOGIN")

    const schema = v.object({
      email: v.pipe(v.string(), v.email("Email is not valid")),
      password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters long")),
    })

    const loginData = Object.fromEntries(await request.formData())
    const { output: data, issues: parseError, success } = v.safeParse(schema, loginData)

    if (!success) {
      console.debug("Invalid Form Data:", parseError)
      console.timeEnd("LOGIN")
      return fail(400, {
        email: loginData.email,
        message: parseError[0].message,
        error: true,
      })
    }

    const { email, password } = data

    // Check if the user profile exists in public database
    const potentialUser = await getUserByEmailDb(email)
    if (potentialUser.error) {
      console.error("Error Fetching User By Email: ", potentialUser.error)
      console.timeEnd("LOGIN")
      return fail(500, { email, message: "Database lookup failed", error: true })
    }

    if (!potentialUser.data) {
      console.error("User not found in public database")
      console.timeEnd("LOGIN")
      return fail(401, { email, message: "User profile not found. Please sign up first.", error: true })
    }

    console.debug(`Performing supabase signInWithPassword ${email}`)

    const {
      error: authError,
      data: { user: loggedInUser },
    } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !loggedInUser) {
      console.debug(authError)
      console.timeEnd("LOGIN")
      return fail(401, {
        email: email,
        message: authError?.message || "Invalid credentials",
        error: true,
      })
    }

    const redirectTo = url.searchParams.get("redirectTo") || "/app"
    console.log("Redirecting to ", redirectTo)
    console.timeEnd("LOGIN")
    redirect(303, redirectTo)
  },

  signup: async ({ request, locals: { supabase } }) => {
    console.time("SIGNUP")

    const schema = v.object({
      email: v.pipe(v.string(), v.email("Email is not valid")),
      password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters long")),
      role: v.enum_(UserRole, "Please select a valid role"),
    })

    const signupData = Object.fromEntries(await request.formData())
    const { output: data, issues: parseError, success } = v.safeParse(schema, signupData)

    if (!success) {
      console.debug("Invalid Signup Data:", parseError)
      console.timeEnd("SIGNUP")
      return fail(400, {
        email: signupData.email,
        message: parseError[0].message,
        error: true,
      })
    }

    const { email, password, role } = data

    // Check if the user already exists in public database to avoid duplications
    const existingUser = await getUserByEmailDb(email)
    if (existingUser.error) {
      console.timeEnd("SIGNUP")
      return fail(500, { email, message: "Database lookup failed", error: true })
    }
    if (existingUser.data) {
      console.timeEnd("SIGNUP")
      return fail(400, { email, message: "User with this email already exists", error: true })
    }

    console.debug(`Performing supabase signUp ${email}`)

    const {
      error: authError,
      data: { user: signedUpUser },
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        },
      },
    })

    if (authError || !signedUpUser) {
      console.debug(authError)
      console.timeEnd("SIGNUP")
      return fail(400, {
        email: email,
        message: authError?.message || "Failed to create account",
        error: true,
      })
    }

    // Insert user into public database users table
    const dbInsert = await createUserDb(signedUpUser.id, email, role)
    if (dbInsert.error) {
      console.error("Failed to insert user profile in database:", dbInsert.error)
      console.timeEnd("SIGNUP")
      return fail(500, {
        email: email,
        message: "Account was created, but initializing user profile failed.",
        error: true,
      })
    }

    console.timeEnd("SIGNUP")
    redirect(303, "/app")
  },
}
