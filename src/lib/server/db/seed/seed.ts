import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as s from "$lib/db/schema"
import { VEHICLES_DATA, DRIVERS_DATA, TRIPS_DATA, MAINTENANCE_DATA, FUEL_DATA } from "$lib/data"
import { VehicleStatus, DriverStatus, TripStatus, MaintenanceLogStatus, ExpenseType } from "$lib/constants"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not set in environment.")
  process.exit(1)
}

const client = postgres(databaseUrl, { max: 1 })
const db = drizzle(client, { schema: s })

// Status mapping helpers
function mapVehicleStatus(status: string): VehicleStatus {
  if (status === "active" || status === "idle") return VehicleStatus.AVAILABLE
  if (status === "maintenance") return VehicleStatus.IN_SHOP
  return VehicleStatus.RETIRED
}

function mapDriverStatus(status: string): DriverStatus {
  if (status === "active") return DriverStatus.AVAILABLE
  if (status === "on_leave") return DriverStatus.OFF_DUTY
  return DriverStatus.SUSPENDED
}

function mapTripStatus(status: string): TripStatus {
  if (status === "scheduled") return TripStatus.DRAFT
  if (status === "in_progress") return TripStatus.DISPATCHED
  if (status === "completed") return TripStatus.COMPLETED
  return TripStatus.CANCELLED
}

async function main() {
  console.log("Starting database seeding...")

  try {
    // 1. Clean existing data
    console.log("Cleaning old records...")
    await db.delete(s.expenses)
    await db.delete(s.maintenanceLogs)
    await db.delete(s.trips)
    await db.delete(s.drivers)
    await db.delete(s.vehicles)

    // 2. Seed Vehicles
    console.log("Seeding vehicles...")
    const seededVehicles = []
    for (const v of VEHICLES_DATA) {
      const [inserted] = await db
        .insert(s.vehicles)
        .values({
          registrationNumber: v.plate,
          name: `${v.make} ${v.model}`,
          type: v.type,
          maxLoadCapacity: String(v.capacity),
          odometer: String(v.mileage),
          acquisitionCost: "1500000",
          status: mapVehicleStatus(v.status),
        })
        .returning()
      seededVehicles.push(inserted)
    }
    console.log(`Seeded ${seededVehicles.length} vehicles.`)

    // 3. Seed Drivers
    console.log("Seeding drivers...")
    const seededDrivers = []
    for (const d of DRIVERS_DATA) {
      const [inserted] = await db
        .insert(s.drivers)
        .values({
          name: d.name,
          licenseNumber: d.license,
          licenseCategory: d.licenseClass,
          licenseExpiryDate: new Date("2029-12-31").toISOString(),
          contactNumber: d.phone,
          safetyScore: Math.round(d.rating * 20),
          status: mapDriverStatus(d.status),
        })
        .returning()
      seededDrivers.push(inserted)
    }
    console.log(`Seeded ${seededDrivers.length} drivers.`)

    // 4. Seed Trips
    console.log("Seeding trips...")
    let tripCount = 0
    for (const t of TRIPS_DATA) {
      const v = seededVehicles.find((x) => x.registrationNumber === t.vehicle) || seededVehicles[0]
      const d = seededDrivers.find((x) => x.name === t.driver) || seededDrivers[0]
      const parts = t.route.split(" - ")

      await db.insert(s.trips).values({
        source: parts[0] || "Nairobi",
        destination: parts[1] || "Mombasa",
        vehicleId: v.id,
        driverId: d.id,
        cargoWeight: "10",
        plannedDistance: String(t.distance),
        status: mapTripStatus(t.status),
      })
      tripCount++
    }
    console.log(`Seeded ${tripCount} trips.`)

    // 5. Seed Maintenance Logs
    console.log("Seeding maintenance logs...")
    let maintenanceCount = 0
    for (const m of MAINTENANCE_DATA) {
      const v = seededVehicles.find((x) => x.registrationNumber === m.vehicle) || seededVehicles[0]
      const apiStatus = m.status === "completed" ? MaintenanceLogStatus.CLOSED : MaintenanceLogStatus.OPEN

      await db.insert(s.maintenanceLogs).values({
        vehicleId: v.id,
        description: `${m.type} (${m.technician || "General Tech"}) [Priority: ${m.priority}]`,
        status: apiStatus,
        cost: String(m.cost),
        dateLogged: new Date(m.scheduled).toISOString(),
      })
      maintenanceCount++
    }
    console.log(`Seeded ${maintenanceCount} maintenance logs.`)

    // 6. Seed Expenses
    console.log("Seeding expenses...")
    let expenseCount = 0
    for (const f of FUEL_DATA) {
      const v = seededVehicles.find((x) => x.registrationNumber === f.vehicle) || seededVehicles[0]
      await db.insert(s.expenses).values({
        vehicleId: v.id,
        type: ExpenseType.FUEL,
        cost: String(f.total),
        liters: String(f.liters),
        date: new Date(f.date).toISOString(),
      })
      expenseCount++
    }
    console.log(`Seeded ${expenseCount} expenses.`)

    console.log("Seeding completed successfully!")
    process.exit(0)
  } catch (err) {
    console.error("Error during seeding:", err)
    process.exit(1)
  }
}

main()
