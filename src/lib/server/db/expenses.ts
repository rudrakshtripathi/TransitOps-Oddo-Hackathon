import * as s from "$lib/db/schema"
import { eq } from "drizzle-orm"
import { db, handleDbError } from "./common"

export type Expense = typeof s.expenses.$inferSelect
export type NewExpense = typeof s.expenses.$inferInsert

export async function getExpensesDb(): Promise<{ data: any[] | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: getExpensesDb"
  console.time(TAG)
  try {
    // Return combined query data for page display
    const joinedData = await db
      .select({
        id: s.expenses.id,
        vehiclePlate: s.vehicles.registrationNumber,
        type: s.expenses.type,
        cost: s.expenses.cost,
        liters: s.expenses.liters,
        date: s.expenses.date,
        createdAt: s.expenses.createdAt,
      })
      .from(s.expenses)
      .innerJoin(s.vehicles, eq(s.expenses.vehicleId, s.vehicles.id))
      .orderBy(s.expenses.createdAt)

    return { data: joinedData, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function createExpenseDb(
  expense: NewExpense,
): Promise<{ data: Expense | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: createExpenseDb"
  console.time(TAG)
  try {
    const [data] = await db.insert(s.expenses).values(expense).returning()
    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function updateExpenseDb(
  id: string,
  expense: Partial<NewExpense>,
): Promise<{ data: Expense | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: updateExpenseDb(${id})`
  console.time(TAG)
  try {
    const [data] = await db.update(s.expenses).set(expense).where(eq(s.expenses.id, id)).returning()
    return { data: data || null, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function deleteExpenseDb(
  id: string,
): Promise<{ data: { id: string } | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: deleteExpenseDb(${id})`
  console.time(TAG)
  try {
    await db.delete(s.expenses).where(eq(s.expenses.id, id))
    return { data: { id }, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
