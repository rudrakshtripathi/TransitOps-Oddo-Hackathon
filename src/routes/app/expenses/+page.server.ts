import { db } from '$lib/db';
import { expenses, vehicles } from '$lib/db/schema';
import { ExpenseType } from '$lib/constants';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import type { PageServerLoad, Actions } from './$types';

const ExpenseSchema = v.object({
	vehicleId: v.pipe(v.string(), v.uuid()),
	type: v.enum(ExpenseType),
	cost: v.pipe(v.string(), v.transform(Number), v.minValue(0)),
	liters: v.optional(v.pipe(v.string(), v.transform(Number), v.minValue(0)))
});

export const load: PageServerLoad = async () => {
	const [allExpenses, allVehicles] = await Promise.all([
		db.query.expenses.findMany({ orderBy: (e, { desc }) => [desc(e.date)] }),
		db.select().from(vehicles)
	]);
	return { expenses: allExpenses, vehicles: allVehicles };
};

export const actions: Actions = {
	create: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const raw = Object.fromEntries(await request.formData());
		const result = v.safeParse(ExpenseSchema, raw);
		if (!result.success) return fail(400, { error: v.flatten(result.issues).root?.[0] ?? 'Invalid input' });
		const { cost, liters, vehicleId, ...rest } = result.output;
		await db.insert(expenses).values({
			...rest,
			vehicleId,
			cost: String(cost),
			liters: liters !== undefined ? String(liters) : null
		});
		return { success: true };
	},

	delete: async ({ request, locals: { user } }) => {
		if (!user) redirect(303, '/auth');
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing expense ID' });
		await db.delete(expenses).where(eq(expenses.id, id));
		return { success: true };
	}
};
