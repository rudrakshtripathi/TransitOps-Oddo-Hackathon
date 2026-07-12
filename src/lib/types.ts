import type { InferSelectModel } from 'drizzle-orm';
import type { users, vehicles, drivers, trips, maintenanceLogs, expenses } from '$lib/db/schema';

export type DbUser = InferSelectModel<typeof users>;
export type Vehicle = InferSelectModel<typeof vehicles>;
export type Driver = InferSelectModel<typeof drivers>;
export type Trip = InferSelectModel<typeof trips>;
export type MaintenanceLog = InferSelectModel<typeof maintenanceLogs>;
export type Expense = InferSelectModel<typeof expenses>;

// Decimal fields in Drizzle come back as strings from postgres — use these helpers
export function toNum(val: string | number | null | undefined): number {
	if (val === null || val === undefined) return 0;
	return Number(val);
}
