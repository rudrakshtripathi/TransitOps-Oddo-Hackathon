import * as s from "$lib/db/schema"
import { UserRole } from "$lib/constants"
import { db, handleDbError } from "./common"
import { eq } from "drizzle-orm"
import type { User } from "$lib/types"

/**
 * Gets the user profile associated with a user ID
 */
export async function getUserById(id: string): Promise<{ data: User | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: getUserById(${id})`
  console.time(TAG)

  try {
    const [userProfile] = await db
      .select()
      .from(s.users)
      .where(eq(s.users.id, id))
      .limit(1)

    return { data: userProfile || null, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Gets the user profile associated with an email
 */
export async function getUserByEmail(
  email: string,
): Promise<{ data: User | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: getUserByEmail(${email})`
  console.time(TAG)

  try {
    const [userProfile] = await db
      .select()
      .from(s.users)
      .where(eq(s.users.email, email))
      .limit(1)

    return { data: userProfile || null, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Creates a new user profile in the public users table
 */
export async function createUser(
  id: string,
  email: string,
  role: UserRole,
): Promise<{ data: User; error: null } | { data: null; error: string }> {
  const TAG = `DB: createUser(${email})`
  console.time(TAG)

  try {
    const [newUser] = await db
      .insert(s.users)
      .values({
        id,
        email,
        role,
      })
      .returning()

    return { data: newUser, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
