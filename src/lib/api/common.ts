import { error } from '@sveltejs/kit';

import { UserRole } from '$lib/types';

/**
 * Guard Function to check for Auth, otherwise throw 403 Forbidden
 */
export function requireAuth(locals: App.Locals) {
	const { user, supabase, session } = locals;

	if (!user || !session) {
		console.error('Unauthorized call to remote function');
		error(401, 'Unauthorized');
	}

	return { user, session, supabase };
}
