import { command, getRequestEvent, query } from "$app/server"
import {
  createMaintenanceLogDb,
  deleteMaintenanceLogDb,
  getMaintenanceLogsDb,
  updateMaintenanceLogDb,
  type NewMaintenanceLog,
} from "$lib/server/db/maintenance"
import { requireAuth } from "./common"

export const getMaintenanceLogs = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getMaintenanceLogsDb()
})

export const createMaintenanceLog = command("unchecked", async (log: NewMaintenanceLog) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await createMaintenanceLogDb(log)
})

export const updateMaintenanceLog = command(
  "unchecked",
  async ({ id, log }: { id: string; log: Partial<NewMaintenanceLog> }) => {
    const event = getRequestEvent()
    requireAuth(event.locals)
    return await updateMaintenanceLogDb(id, log)
  },
)

export const deleteMaintenanceLog = command("unchecked", async (id: string) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await deleteMaintenanceLogDb(id)
})
