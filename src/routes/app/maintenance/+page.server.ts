import { db } from '$lib/db';
import { maintenanceLogs, vehicles } from '$lib/db/schema';
import { MaintenanceLogStatus, VehicleStatus } from '$lib/constants';
import { fail, redirect } from '@sveltejs/kit';
import { eq, ne } from 'drizzle-orm';
import * as v from 'valibot';
import type { PageServerLoad, Actions } from './$types';

const MaintenanceSchema = v.object({
	vehicleId: v.pipe(v.string(), v.uuid()),
	description: v.pipe(v.string(), v.trim(), v.minLength(5)),
	cost: v.pipe(v.string(), v.transform(Number), v.minValue(0))
});

export const load: PageServerLoad = async () => {
	const [logs, allVehicles] = await Promise.all([
		db.query.maintenanceLogs.findMany({ orderBy: (m, { desc }) => [desc(m.dateLogged)] }),
		db.select().from(vehicles)
	]);
	return { logs, vehicles: allVehicles };
};

export const actions: Actions = {
	create: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const raw = Object.fromEntries(await request.formData());
		const result = v.safeParse(MaintenanceSchema, raw);
		if (!result.success) return fail(400, { error: v.flatten(result.issues).root?.[0] ?? 'Invalid input' });
		const { vehicleId, cost, ...rest } = result.output;
		await db.transaction(async (tx) => {
			await tx.insert(maintenanceLogs).values({
				...rest,
				vehicleId,
				cost: String(cost),
				status: MaintenanceLogStatus.OPEN
			});
			// Automatically put vehicle in shop when maintenance is opened
			await tx.update(vehicles)
				.set({ status: VehicleStatus.IN_SHOP })
				.where(eq(vehicles.id, vehicleId));
		});
		return { success: true };
	},

	close: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing log ID' });
		const log = await db.query.maintenanceLogs.findFirst({ where: eq(maintenanceLogs.id, id) });
		if (!log) return fail(404, { error: 'Log not found' });
		const vehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.id, log.vehicleId) });
		await db.transaction(async (tx) => {
			await tx.update(maintenanceLogs).set({ status: MaintenanceLogStatus.CLOSED }).where(eq(maintenanceLogs.id, id));
			// Only restore vehicle to available if it's not retired
			if (vehicle && vehicle.status !== VehicleStatus.RETIRED) {
				await tx.update(vehicles).set({ status: VehicleStatus.AVAILABLE }).where(eq(vehicles.id, log.vehicleId));
			}
		});
		return { success: true };
	}
};
