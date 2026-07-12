import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	if (session) redirect(303, '/app');
};

export const actions: Actions = {
	login: async ({ request, locals: { supabase }, url }) => {
		const form = await request.formData();
		const email = (form.get('email') as string)?.trim() ?? '';
		const password = form.get('password') as string;

		if (!email || !password) return fail(400, { error: 'Email and password are required.', email });

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) return fail(400, { error: error.message, email });

		const redirectTo = url.searchParams.get('redirectTo') ?? '/app';
		const safePath = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/app';
		redirect(303, safePath);
	},

	signup: async ({ request, locals: { supabase } }) => {
		const form = await request.formData();
		const email = (form.get('email') as string)?.trim() ?? '';
		const password = form.get('password') as string;
		if (!email || !password) return fail(400, { error: 'Email and password are required.', email });
		// Dummy signup implementation
		const { error } = await supabase.auth.signUp({ email, password });
		if (error) return fail(400, { error: error.message, email });
		redirect(303, '/auth?message=Check your email');
	},

	logout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		redirect(303, '/auth');
	}
};
