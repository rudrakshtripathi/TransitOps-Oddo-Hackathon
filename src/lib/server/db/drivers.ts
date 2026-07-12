import { DriverStatus } from "$lib/constants"
import * as s from "$lib/db/schema"
import { eq } from "drizzle-orm"
import { db, handleDbError } from "./common"

export type Driver = typeof s.drivers.$inferSelect
export type NewDriver = typeof s.drivers.$inferInsert

export function mapUiToDbStatus(status: string): DriverStatus {
  if (status === "active") return DriverStatus.AVAILABLE
  if (status === "on_leave") return DriverStatus.OFF_DUTY
  return DriverStatus.SUSPENDED
}

export function mapDbToUiStatus(status: DriverStatus): "active" | "on_leave" | "inactive" {
  if (status === DriverStatus.AVAILABLE) return "active"
  if (status === DriverStatus.ON_TRIP) return "active"
  if (status === DriverStatus.OFF_DUTY) return "on_leave"
  return "inactive"
}

export async function getDriversDb(): Promise<{ data: any[] | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: getDriversDb"
  console.time(TAG)
  try {
    const data = await db
      .select({
        id: s.drivers.id,
        name: s.drivers.name,
        licenseNumber: s.drivers.licenseNumber,
        licenseCategory: s.drivers.licenseCategory,
        contactNumber: s.drivers.contactNumber,
        safetyScore: s.drivers.safetyScore,
        status: s.drivers.status,
      })
      .from(s.drivers)
      .orderBy(s.drivers.createdAt)

    const mappedData = data.map((d) => ({
      ...d,
      status: mapDbToUiStatus(d.status),
    }))

    return { data: mappedData, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function createDriverDb(
  driver: NewDriver,
): Promise<{ data: Driver | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: createDriverDb"
  console.time(TAG)
  try {
    const payload: NewDriver = {
      ...driver,
      status: mapUiToDbStatus(driver.status as string),
    }
    const [data] = await db.insert(s.drivers).values(payload).returning()
    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function updateDriverDb(
  id: string,
  driver: Partial<NewDriver>,
): Promise<{ data: Driver | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: updateDriverDb(${id})`
  console.time(TAG)
  try {
    const payload: Partial<NewDriver> = {
      ...driver,
      status: driver.status ? mapUiToDbStatus(driver.status as string) : undefined,
    }
    const [data] = await db.update(s.drivers).set(payload).where(eq(s.drivers.id, id)).returning()
    return { data: data || null, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function deleteDriverDb(
  id: string,
): Promise<{ data: { id: string } | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: deleteDriverDb(${id})`
  console.time(TAG)
  try {
    await db.delete(s.drivers).where(eq(s.drivers.id, id))
    return { data: { id }, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
