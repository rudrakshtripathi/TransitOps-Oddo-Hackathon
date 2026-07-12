import { pgTable, text, timestamp, uuid, pgEnum, decimal, integer } from "drizzle-orm/pg-core"

import { UserRole, VehicleStatus, DriverStatus, TripStatus, ExpenseType, MaintenanceLogStatus } from "$lib/constants"
import { sql } from "drizzle-orm"

export function enumToPgEnum<T extends Record<string, string>>(myEnum: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum) as [T[keyof T], ...T[keyof T][]]
}

// --- Enums ---
export const userRoleEnum = pgEnum("role", enumToPgEnum(UserRole))
export const vehicleStatusEnum = pgEnum("vehicle_status", enumToPgEnum(VehicleStatus))
export const driverStatusEnum = pgEnum("driver_status", enumToPgEnum(DriverStatus))
export const tripStatusEnum = pgEnum("trip_status", enumToPgEnum(TripStatus))
export const expenseTypeEnum = pgEnum("expense_type", enumToPgEnum(ExpenseType))
export const maintenanceLogStatusEnum = pgEnum("maintenance_log_status", enumToPgEnum(MaintenanceLogStatus))

const timestamps = {
  createdAt: timestamp({ precision: 3, mode: "string", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ precision: 3, mode: "string", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
}

// --- Tables ---
export const users = pgTable("users", {
  // maps to auth.users.id
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull(),

  ...timestamps,
})

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  // Name/Model
  name: text("name").notNull(),
  type: text("type").notNull(),
  // stored as numeric/decimal
  maxLoadCapacity: decimal("max_load_capacity").notNull(),
  odometer: decimal("odometer").default("0").notNull(),
  acquisitionCost: decimal("acquisition_cost").notNull(),
  status: vehicleStatusEnum("status").notNull(),

  ...timestamps,
})

export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  licenseCategory: text("license_category").notNull(),
  licenseExpiryDate: timestamp({ precision: 3, mode: "string", withTimezone: true }).notNull(),
  contactNumber: text("contact_number").notNull(),
  safetyScore: integer("safety_score").default(100).notNull(),
  status: driverStatusEnum("status").notNull(),

  ...timestamps,
})

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id, { onDelete: "restrict" })
    .notNull(),
  driverId: uuid("driver_id")
    .references(() => drivers.id, { onDelete: "restrict" })
    .notNull(),
  cargoWeight: decimal("cargo_weight").notNull(),
  plannedDistance: decimal("planned_distance").notNull(),
  status: tripStatusEnum("status").notNull(),

  ...timestamps,
})

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  status: maintenanceLogStatusEnum("status").notNull(),
  cost: decimal("cost"),
  dateLogged: timestamp("date_logged", { precision: 3, mode: "string", withTimezone: true }).defaultNow().notNull(),

  ...timestamps,
})

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id, { onDelete: "cascade" })
    .notNull(),
  type: expenseTypeEnum("type").notNull(),
  cost: decimal("cost").notNull(),
  liters: decimal("liters"), // Only populated if type === 'Fuel'
  date: timestamp("date", { precision: 3, mode: "string", withTimezone: true }).defaultNow().notNull(),

  ...timestamps,
})
