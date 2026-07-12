import { db } from '$lib/db';
import { trips, vehicles, drivers } from '$lib/db/schema';
import { TripStatus, VehicleStatus, DriverStatus } from '$lib/constants';
import { fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import * as v from 'valibot';
import type { PageServerLoad, Actions } from './$types';

const TripSchema = v.object({
	source: v.pipe(v.string(), v.trim(), v.minLength(2)),
	destination: v.pipe(v.string(), v.trim(), v.minLength(2)),
	vehicleId: v.pipe(v.string(), v.uuid()),
	driverId: v.pipe(v.string(), v.uuid()),
	cargoWeight: v.pipe(v.string(), v.transform(Number), v.minValue(0)),
	plannedDistance: v.pipe(v.string(), v.transform(Number), v.minValue(0)),
});

export const load: PageServerLoad = async () => {
	const [allTrips, availableVehicles, availableDrivers] = await Promise.all([
		db.query.trips.findMany({ orderBy: (t, { desc }) => [desc(t.createdAt)] }),
		db.select().from(vehicles).where(eq(vehicles.status, VehicleStatus.AVAILABLE)),
		db.select().from(drivers).where(eq(drivers.status, DriverStatus.AVAILABLE))
	]);
	return { trips: allTrips, availableVehicles, availableDrivers };
};

export const actions: Actions = {
	create: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const raw = Object.fromEntries(await request.formData());
		const result = v.safeParse(TripSchema, raw);
		if (!result.success) return fail(400, { error: v.flatten(result.issues).root?.[0] ?? 'Invalid input' });
		const { cargoWeight, plannedDistance, vehicleId, driverId, ...rest } = result.output;

		// Validate cargo weight against vehicle capacity
		const vehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.id, vehicleId) });
		if (vehicle && cargoWeight > Number(vehicle.maxLoadCapacity)) {
			return fail(400, { error: `Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacity} kg)` });
		}

		await db.insert(trips).values({
			...rest,
			vehicleId,
			driverId,
			cargoWeight: String(cargoWeight),
			plannedDistance: String(plannedDistance),
			status: TripStatus.DRAFT
		});
		return { success: true };
	},

	dispatch: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing trip ID' });
		const trip = await db.query.trips.findFirst({ where: eq(trips.id, id) });
		if (!trip || trip.status !== TripStatus.DRAFT) return fail(400, { error: 'Trip cannot be dispatched' });
		await db.transaction(async (tx) => {
			await tx.update(trips).set({ status: TripStatus.DISPATCHED }).where(eq(trips.id, id));
			await tx.update(vehicles).set({ status: VehicleStatus.ON_TRIP }).where(eq(vehicles.id, trip.vehicleId));
			await tx.update(drivers).set({ status: DriverStatus.ON_TRIP }).where(eq(drivers.id, trip.driverId));
		});
		return { success: true };
	},

	complete: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing trip ID' });
		const trip = await db.query.trips.findFirst({ where: eq(trips.id, id) });
		if (!trip || trip.status !== TripStatus.DISPATCHED) return fail(400, { error: 'Trip is not dispatched' });
		await db.transaction(async (tx) => {
			await tx.update(trips).set({ status: TripStatus.COMPLETED }).where(eq(trips.id, id));
			await tx.update(vehicles).set({ status: VehicleStatus.AVAILABLE }).where(eq(vehicles.id, trip.vehicleId));
			await tx.update(drivers).set({ status: DriverStatus.AVAILABLE }).where(eq(drivers.id, trip.driverId));
		});
		return { success: true };
	},

	cancel: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing trip ID' });
		const trip = await db.query.trips.findFirst({ where: eq(trips.id, id) });
		if (!trip || !['Draft', 'Dispatched'].includes(trip.status)) return fail(400, { error: 'Trip cannot be cancelled' });
		await db.transaction(async (tx) => {
			await tx.update(trips).set({ status: TripStatus.CANCELLED }).where(eq(trips.id, id));
			if (trip.status === TripStatus.DISPATCHED) {
				await tx.update(vehicles).set({ status: VehicleStatus.AVAILABLE }).where(eq(vehicles.id, trip.vehicleId));
				await tx.update(drivers).set({ status: DriverStatus.AVAILABLE }).where(eq(drivers.id, trip.driverId));
			}
		});
		return { success: true };
	}
};
