import { VehicleStatus } from "$lib/constants"
import * as s from "$lib/db/schema"
import { eq } from "drizzle-orm"
import { db, handleDbError } from "./common"

export type Vehicle = typeof s.vehicles.$inferSelect
export type NewVehicle = typeof s.vehicles.$inferInsert

export function mapUiToDbStatus(status: string): VehicleStatus {
  if (status === "active") return VehicleStatus.AVAILABLE
  if (status === "idle") return VehicleStatus.AVAILABLE
  if (status === "maintenance") return VehicleStatus.IN_SHOP
  return VehicleStatus.RETIRED
}

export function mapDbToUiStatus(status: VehicleStatus): "active" | "idle" | "maintenance" | "retired" {
  if (status === VehicleStatus.AVAILABLE) return "active"
  if (status === VehicleStatus.ON_TRIP) return "active"
  if (status === VehicleStatus.IN_SHOP) return "maintenance"
  return "retired"
}

export async function getVehiclesDb(): Promise<{ data: any[] | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: getVehiclesDb"
  console.time(TAG)
  try {
    const data = await db.select().from(s.vehicles).orderBy(s.vehicles.createdAt)

    const mappedData = data.map((v) => ({
      ...v,
      status: mapDbToUiStatus(v.status),
    }))

    return { data: mappedData, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function createVehicleDb(
  vehicle: NewVehicle,
): Promise<{ data: Vehicle | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: createVehicleDb"
  console.time(TAG)
  try {
    const payload: NewVehicle = {
      ...vehicle,
      status: mapUiToDbStatus(vehicle.status as string),
    }
    const [data] = await db.insert(s.vehicles).values(payload).returning()
    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function updateVehicleDb(
  id: string,
  vehicle: Partial<NewVehicle>,
): Promise<{ data: Vehicle | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: updateVehicleDb(${id})`
  console.time(TAG)
  try {
    const payload: Partial<NewVehicle> = {
      ...vehicle,
      status: vehicle.status ? mapUiToDbStatus(vehicle.status as string) : undefined,
    }
    const [data] = await db.update(s.vehicles).set(payload).where(eq(s.vehicles.id, id)).returning()
    return { data: data || null, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function deleteVehicleDb(
  id: string,
): Promise<{ data: { id: string } | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: deleteVehicleDb(${id})`
  console.time(TAG)
  try {
    await db.delete(s.vehicles).where(eq(s.vehicles.id, id))
    return { data: { id }, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
