import { db } from '$lib/db';
import { vehicles, drivers, trips, maintenanceLogs, expenses } from '$lib/db/schema';
import { VehicleStatus, DriverStatus, TripStatus, MaintenanceLogStatus } from '$lib/constants';
import { eq, count, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [vehicleStats, driverStats, tripStats, maintenanceCount, recentTrips] = await Promise.all([
		db.select({
			status: vehicles.status,
			total: count()
		}).from(vehicles).groupBy(vehicles.status),

		db.select({
			status: drivers.status,
			total: count()
		}).from(drivers).groupBy(drivers.status),

		db.select({
			status: trips.status,
			total: count()
		}).from(trips).groupBy(trips.status),

		db.select({ total: count() }).from(maintenanceLogs)
			.where(eq(maintenanceLogs.status, MaintenanceLogStatus.OPEN)),

		db.query.trips.findMany({
			orderBy: (t, { desc }) => [desc(t.createdAt)],
			limit: 5,
			with: { vehicle: true, driver: true }
		})
	]);

	const toMap = (arr: { status: string; total: number }[]) =>
		Object.fromEntries(arr.map(r => [r.status, Number(r.total)]));

	return {
		vehicleStats: toMap(vehicleStats as { status: string; total: number }[]),
		driverStats: toMap(driverStats as { status: string; total: number }[]),
		tripStats: toMap(tripStats as { status: string; total: number }[]),
		openMaintenanceCount: Number(maintenanceCount[0]?.total ?? 0),
		recentTrips
	};
};
