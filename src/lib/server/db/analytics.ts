import * as s from "$lib/db/schema"
import { ExpenseType } from "$lib/constants"
import { sql } from "drizzle-orm"
import { db, handleDbError } from "./common"

/**
 * Get vehicle counts grouped by status for the fleet status pie chart.
 */
export async function getVehicleStatusCountsDb(): Promise<
  { data: { name: string; value: number }[] | null; error: null } | { data: null; error: string }
> {
  const TAG = "DB: getVehicleStatusCountsDb"
  console.time(TAG)
  try {
    const result = await db.execute(sql`
      SELECT ${s.vehicles.status} as status, COUNT(*)::int as value
      FROM ${s.vehicles}
      GROUP BY ${s.vehicles.status}
    `)

    const statusMap: Record<string, string> = {
      Available: "Active",
      "On Trip": "On Trip",
      "In Shop": "Maintenance",
      Retired: "Retired",
    }

    const data = (result as unknown as { status: string; value: number }[]).map((row) => ({
      name: statusMap[row.status] ?? row.status,
      value: Number(row.value),
    }))

    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get trip counts + expense breakdown (fuel vs other) per month for the last 6 months.
 */
export async function getMonthlyStatsDb(): Promise<
  | { data: { month: string; trips: number; fuel: number; maintenance: number }[] | null; error: null }
  | { data: null; error: string }
> {
  const TAG = "DB: getMonthlyStatsDb"
  console.time(TAG)
  try {
    // Trip counts per month
    const tripRows = await db.execute(sql`
      SELECT to_char(${s.trips.createdAt}, 'Mon') as month,
             COUNT(*)::int as trips,
             DATE_TRUNC('month', ${s.trips.createdAt}) as month_start
      FROM ${s.trips}
      WHERE ${s.trips.createdAt} >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_start
      ORDER BY month_start
    `)

    // Expense sums per month by type
    const expenseRows = await db.execute(sql`
      SELECT to_char(${s.expenses.date}, 'Mon') as month,
             SUM(CASE WHEN ${s.expenses.type} = ${ExpenseType.FUEL} THEN ${s.expenses.cost}::numeric ELSE 0 END)::int as fuel,
             SUM(CASE WHEN ${s.expenses.type} != ${ExpenseType.FUEL} THEN ${s.expenses.cost}::numeric ELSE 0 END)::int as other,
             DATE_TRUNC('month', ${s.expenses.date}) as month_start
      FROM ${s.expenses}
      WHERE ${s.expenses.date} >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_start
      ORDER BY month_start
    `)

    // Build a lookup from expense data keyed by month abbreviation
    const expenseMap = new Map<string, { fuel: number; maintenance: number }>()
    for (const row of expenseRows as unknown as { month: string; fuel: number; other: number }[]) {
      expenseMap.set(row.month, {
        fuel: Number(row.fuel),
        maintenance: Number(row.other),
      })
    }

    // Combine trip + expense data by month
    const data = (tripRows as unknown as { month: string; trips: number }[]).map((row) => {
      const expense = expenseMap.get(row.month)
      return {
        month: row.month,
        trips: Number(row.trips),
        fuel: expense?.fuel ?? 0,
        maintenance: expense?.maintenance ?? 0,
      }
    })

    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Aggregate planned distance from trips by day of the week.
 */
export async function getWeeklyDistanceDb(): Promise<
  { data: { day: string; km: number }[] | null; error: null } | { data: null; error: string }
> {
  const TAG = "DB: getWeeklyDistanceDb"
  console.time(TAG)
  try {
    const result = await db.execute(sql`
      SELECT
        CASE EXTRACT(DOW FROM ${s.trips.createdAt})
          WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
          WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri' WHEN 6 THEN 'Sat'
        END as day,
        COALESCE(SUM(${s.trips.plannedDistance}::numeric), 0)::int as km
      FROM ${s.trips}
      GROUP BY EXTRACT(DOW FROM ${s.trips.createdAt})
      ORDER BY EXTRACT(DOW FROM ${s.trips.createdAt})
    `)

    const data = (result as unknown as { day: string; km: number }[]).map((row) => ({
      day: row.day,
      km: Number(row.km),
    }))

    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

/**
 * Get top 5 drivers by trip count, including their safety score.
 */
export async function getDriverPerformanceDb(): Promise<
  | { data: { name: string; trips: number; safetyScore: number }[] | null; error: null }
  | { data: null; error: string }
> {
  const TAG = "DB: getDriverPerformanceDb"
  console.time(TAG)
  try {
    const result = await db.execute(sql`
      SELECT ${s.drivers.name},
             COUNT(${s.trips.id})::int as trips,
             ${s.drivers.safetyScore} as "safetyScore"
      FROM ${s.drivers}
      LEFT JOIN ${s.trips} ON ${s.trips.driverId} = ${s.drivers.id}
      GROUP BY ${s.drivers.id}, ${s.drivers.name}, ${s.drivers.safetyScore}
      ORDER BY trips DESC
      LIMIT 5
    `)

    const data = (result as unknown as { name: string; trips: number; safetyScore: number }[]).map((row) => ({
      name: row.name,
      trips: Number(row.trips),
      safetyScore: Number(row.safetyScore),
    }))

    return { data, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
