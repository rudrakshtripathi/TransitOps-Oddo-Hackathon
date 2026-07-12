import * as s from "$lib/db/schema"
import { eq } from "drizzle-orm"
import { db, handleDbError } from "./common"

export type MaintenanceLog = typeof s.maintenanceLogs.$inferSelect
export type NewMaintenanceLog = typeof s.maintenanceLogs.$inferInsert

export async function getMaintenanceLogsDb(): Promise<
  { data: any[] | null; error: null } | { data: null; error: string }
> {
  const TAG = "DB: getMaintenanceLogsDb"
  console.time(TAG)
  try {
    // Return combined query data for page display
    const joinedData = await db
      .select({
        id: s.maintenanceLogs.id,
        vehiclePlate: s.vehicles.registrationNumber,
        description: s.maintenanceLogs.description,
        status: s.maintenanceLogs.status,
        cost: s.maintenanceLogs.cost,
        dateLogged: s.maintenanceLogs.dateLogged,
        createdAt: s.maintenanceLogs.createdAt,
      })
      .from(s.maintenanceLogs)
      .innerJoin(s.vehicles, eq(s.maintenanceLogs.vehicleId, s.vehicles.id))
      .orderBy(s.maintenanceLogs.createdAt)

    // Map backend 'Open' / 'Closed' back to frontend status UI strings
    const mappedData = joinedData.map((m) => ({
      ...m,
      status: m.status === "Closed" ? "completed" : "upcoming",
    }))

    return { data: mappedData, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function createMaintenanceLogDb(
  log: NewMaintenanceLog,
): Promise<{ data: MaintenanceLog | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: createMaintenanceLogDb"
  console.time(TAG)
  try {
    const [data] = await db.insert(s.maintenanceLogs).values(log).returning()
    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function updateMaintenanceLogDb(
  id: string,
  log: Partial<NewMaintenanceLog>,
): Promise<{ data: MaintenanceLog | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: updateMaintenanceLogDb(${id})`
  console.time(TAG)
  try {
    const [data] = await db.update(s.maintenanceLogs).set(log).where(eq(s.maintenanceLogs.id, id)).returning()
    return { data: data || null, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function deleteMaintenanceLogDb(
  id: string,
): Promise<{ data: { id: string } | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: deleteMaintenanceLogDb(${id})`
  console.time(TAG)
  try {
    await db.delete(s.maintenanceLogs).where(eq(s.maintenanceLogs.id, id))
    return { data: { id }, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
