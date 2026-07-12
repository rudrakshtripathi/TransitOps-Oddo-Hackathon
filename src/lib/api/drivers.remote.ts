import { command, getRequestEvent, query } from "$app/server"
import { createDriverDb, deleteDriverDb, getDriversDb, updateDriverDb, type NewDriver } from "$lib/server/db/drivers"
import { requireAuth } from "./common"

export const getDrivers = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getDriversDb()
})

export const createDriver = command("unchecked", async (driver: NewDriver) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await createDriverDb(driver)
})

export const updateDriver = command("unchecked", async ({ id, driver }: { id: string; driver: Partial<NewDriver> }) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await updateDriverDb(id, driver)
})

export const deleteDriver = command("unchecked", async (id: string) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await deleteDriverDb(id)
})
