import { TripStatus } from "$lib/constants"
import * as s from "$lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { db, handleDbError } from "./common"

export type Trip = typeof s.trips.$inferSelect
export type NewTrip = typeof s.trips.$inferInsert

export function mapUiToDbStatus(status: string): TripStatus {
  if (status === "scheduled") return TripStatus.DRAFT
  if (status === "in_progress") return TripStatus.DISPATCHED
  if (status === "completed") return TripStatus.COMPLETED
  return TripStatus.CANCELLED
}

export function mapDbToUiStatus(status: TripStatus): "scheduled" | "in_progress" | "completed" | "cancelled" {
  if (status === TripStatus.DRAFT) return "scheduled"
  if (status === TripStatus.DISPATCHED) return "in_progress"
  if (status === TripStatus.COMPLETED) return "completed"
  return "cancelled"
}

export async function getTripsDb(): Promise<{ data: any[] | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: getTripsDb"
  console.time(TAG)
  try {
    // Return combined query data for page display
    const joinedData = await db
      .select({
        id: s.trips.id,
        source: s.trips.source,
        destination: s.trips.destination,
        vehiclePlate: s.vehicles.registrationNumber,
        driverName: s.drivers.name,
        plannedDistance: s.trips.plannedDistance,
        status: s.trips.status,
        createdAt: sql<string>`${s.trips.createdAt}::text`,
      })
      .from(s.trips)
      .innerJoin(s.vehicles, eq(s.trips.vehicleId, s.vehicles.id))
      .innerJoin(s.drivers, eq(s.trips.driverId, s.drivers.id))
      .orderBy(s.trips.createdAt)

    const mappedData = joinedData.map((t) => ({
      ...t,
      status: mapDbToUiStatus(t.status),
    }))

    return { data: mappedData, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function createTripDb(
  trip: NewTrip,
): Promise<{ data: Trip | null; error: null } | { data: null; error: string }> {
  const TAG = "DB: createTripDb"
  console.time(TAG)
  try {
    const payload: NewTrip = {
      ...trip,
      status: mapUiToDbStatus(trip.status as string),
    }
    const [data] = await db.insert(s.trips).values(payload).returning()
    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function updateTripDb(
  id: string,
  trip: Partial<NewTrip>,
): Promise<{ data: Trip | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: updateTripDb(${id})`
  console.time(TAG)
  try {
    const payload: Partial<NewTrip> = {
      ...trip,
      status: trip.status ? mapUiToDbStatus(trip.status as string) : undefined,
    }
    const [data] = await db.update(s.trips).set(payload).where(eq(s.trips.id, id)).returning()
    return { data: data || null, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function deleteTripDb(
  id: string,
): Promise<{ data: { id: string } | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: deleteTripDb(${id})`
  console.time(TAG)
  try {
    await db.delete(s.trips).where(eq(s.trips.id, id))
    return { data: { id }, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
