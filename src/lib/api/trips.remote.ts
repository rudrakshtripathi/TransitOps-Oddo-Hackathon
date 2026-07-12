import { command, getRequestEvent, query } from "$app/server"
import { createTripDb, deleteTripDb, getTripsDb, updateTripDb, type NewTrip } from "$lib/server/db/trips"
import { requireAuth } from "./common"

export const getTrips = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getTripsDb()
})

export const createTrip = command("unchecked", async (trip: NewTrip) => {
  const event = getRequestEvent()
  requireAuth(event.locals)

  return await createTripDb(trip)
})

export const updateTrip = command("unchecked", async ({ id, trip }: { id: string; trip: Partial<NewTrip> }) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await updateTripDb(id, trip)
})

export const deleteTrip = command("unchecked", async (id: string) => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await deleteTripDb(id)
})
