import { db } from '$lib/db';
import { drivers } from '$lib/db/schema';
import { DriverStatus } from '$lib/constants';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import type { PageServerLoad, Actions } from './$types';

const DriverSchema = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(2)),
	licenseNumber: v.pipe(v.string(), v.trim(), v.minLength(3)),
	licenseCategory: v.pipe(v.string(), v.trim(), v.minLength(1)),
	licenseExpiryDate: v.pipe(v.string(), v.trim(), v.minLength(1)),
	contactNumber: v.pipe(v.string(), v.trim(), v.minLength(7)),
	safetyScore: v.pipe(v.string(), v.transform(Number), v.minValue(0), v.maxValue(100)),
	status: v.enum(DriverStatus)
});

export const load: PageServerLoad = async () => {
	const allDrivers = await db.query.drivers.findMany({
		orderBy: (d, { desc }) => [desc(d.createdAt)]
	});
	return { drivers: allDrivers };
};

export const actions: Actions = {
	create: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const raw = Object.fromEntries(await request.formData());
		const result = v.safeParse(DriverSchema, raw);
		if (!result.success) return fail(400, { error: v.flatten(result.issues).root?.[0] ?? 'Invalid input' });
		const { safetyScore, ...rest } = result.output;
		await db.insert(drivers).values({ ...rest, safetyScore });
		return { success: true };
	},

	update: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'Missing driver ID' });
		const raw = Object.fromEntries(form);
		const result = v.safeParse(DriverSchema, raw);
		if (!result.success) return fail(400, { error: v.flatten(result.issues).root?.[0] ?? 'Invalid input' });
		const { safetyScore, ...rest } = result.output;
		await db.update(drivers).set({ ...rest, safetyScore }).where(eq(drivers.id, id));
		return { success: true };
	},

	delete: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing driver ID' });
		await db.delete(drivers).where(eq(drivers.id, id));
		return { success: true };
	}
};
