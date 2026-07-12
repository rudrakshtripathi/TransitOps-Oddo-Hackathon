import { db } from '$lib/db';
import { vehicles } from '$lib/db/schema';
import { VehicleStatus } from '$lib/constants';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import type { PageServerLoad, Actions } from './$types';

const VehicleSchema = v.object({
	registrationNumber: v.pipe(v.string(), v.trim(), v.minLength(2, 'Registration required')),
	name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Name required')),
	type: v.pipe(v.string(), v.minLength(1)),
	maxLoadCapacity: v.pipe(v.string(), v.transform(Number), v.minValue(0)),
	acquisitionCost: v.pipe(v.string(), v.transform(Number), v.minValue(0)),
	status: v.enum(VehicleStatus)
});

export const load: PageServerLoad = async () => {
	const allVehicles = await db.query.vehicles.findMany({
		orderBy: (v, { desc }) => [desc(v.createdAt)]
	});
	return { vehicles: allVehicles };
};

export const actions: Actions = {
	create: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const raw = Object.fromEntries(await request.formData());
		const result = v.safeParse(VehicleSchema, raw);
		if (!result.success) return fail(400, { error: v.flatten(result.issues).root?.[0] ?? 'Invalid input' });
		const { maxLoadCapacity, acquisitionCost, ...rest } = result.output;
		await db.insert(vehicles).values({
			...rest,
			maxLoadCapacity: String(maxLoadCapacity),
			acquisitionCost: String(acquisitionCost),
			odometer: '0'
		});
		return { success: true };
	},

	update: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'Missing vehicle ID' });
		const raw = Object.fromEntries(form);
		const result = v.safeParse(VehicleSchema, raw);
		if (!result.success) return fail(400, { error: v.flatten(result.issues).root?.[0] ?? 'Invalid input' });
		const { maxLoadCapacity, acquisitionCost, ...rest } = result.output;
		await db.update(vehicles).set({
			...rest,
			maxLoadCapacity: String(maxLoadCapacity),
			acquisitionCost: String(acquisitionCost)
		}).where(eq(vehicles.id, id));
		return { success: true };
	},

	delete: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'Missing vehicle ID' });
		await db.delete(vehicles).where(eq(vehicles.id, id));
		return { success: true };
	}
};
