import { command, getRequestEvent, query } from "$app/server"
import {
  createExpenseDb,
  deleteExpenseDb,
  getExpensesDb,
  updateExpenseDb,
  type NewExpense,
} from "$lib/server/db/expenses"
import { requireAuth } from "./common"

export const getExpenses = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getExpensesDb()
})

export const createExpense = command("unchecked", async (expense: NewExpense) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await createExpenseDb(expense)
})

export const updateExpense = command(
  "unchecked",
  async ({ id, expense }: { id: string; expense: Partial<NewExpense> }) => {
    const event = getRequestEvent()
    requireAuth(event.locals)
    return await updateExpenseDb(id, expense)
  },
)

export const deleteExpense = command("unchecked", async (id: string) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await deleteExpenseDb(id)
})
