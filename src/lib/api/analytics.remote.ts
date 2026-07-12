import { query, getRequestEvent } from "$app/server"
import { requireAuth } from "./common"
import {
  getVehicleStatusCountsDb,
  getMonthlyStatsDb,
  getWeeklyDistanceDb,
  getDriverPerformanceDb,
} from "$lib/server/db/analytics"

export const getVehicleStatusCounts = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getVehicleStatusCountsDb()
})

export const getMonthlyStats = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getMonthlyStatsDb()
})

export const getWeeklyDistance = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getWeeklyDistanceDb()
})

export const getDriverPerformance = query(async () => {
  const event = getRequestEvent()
  requireAuth(event.locals)
  return await getDriverPerformanceDb()
})
