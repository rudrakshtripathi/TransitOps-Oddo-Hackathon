import { command, getRequestEvent, query } from "$app/server"
import {
  createVehicleDb,
  deleteVehicleDb,
  getVehiclesDb,
  updateVehicleDb,
  type NewVehicle,
} from "$lib/server/db/vehicles"
import { requireAuth } from "./common"

export const getVehicles = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getVehiclesDb()
})

export const createVehicle = command("unchecked", async (vehicle: NewVehicle) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await createVehicleDb(vehicle)
})

export const updateVehicle = command(
  "unchecked",
  async ({ id, vehicle }: { id: string; vehicle: Partial<NewVehicle> }) => {
    const event = getRequestEvent()
    requireAuth(event.locals)
    return await updateVehicleDb(id, vehicle)
  },
)

export const deleteVehicle = command("unchecked", async (id: string) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await deleteVehicleDb(id)
})
