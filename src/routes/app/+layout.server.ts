import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	if (!user) redirect(303, '/auth');

	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, user.id)
	});

	// If user is authenticated but not in our users table, deny access
	if (!dbUser) redirect(303, '/auth');

	return { dbUser };
};
