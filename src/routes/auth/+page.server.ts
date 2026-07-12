import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	if (session) redirect(303, '/app');
};

export const actions: Actions = {
	login: async ({ request, locals: { supabase }, url }) => {
		const form = await request.formData();
		const email = (form.get('email') as string)?.trim();
		const password = form.get('password') as string;

		if (!email || !password) return fail(400, { error: 'Email and password are required.' });

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) return fail(400, { error: error.message });

		// Validate redirectTo to prevent open redirect
		const redirectTo = url.searchParams.get('redirectTo') ?? '/app';
		const safePath = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/app';
		redirect(303, safePath);
	},

	logout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		redirect(303, '/auth');
	}
};
