<script lang="ts">
	import { enhance } from '$app/forms';
	import { Truck, Eye, EyeOff, AlertCircle, Loader2 } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let showPassword = $state(false);
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In — TransitOps</title>
	<meta name="description" content="Sign in to your TransitOps fleet management console" />
</svelte:head>

<div class="min-h-screen bg-background flex">
	<!-- Left branding panel (hidden on mobile) -->
	<div class="hidden lg:flex flex-1 flex-col relative overflow-hidden bg-[#0F172A]">
		<div class="absolute inset-0 bg-[linear-gradient(135deg,#1E3A5F_0%,#0F172A_50%,#162032_100%)]"></div>
		<div class="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
		<div class="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-blue-800/20 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
		<div class="relative z-10 flex flex-col h-full px-12 py-10">
			<div class="flex items-center gap-3">
				<div class="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
					<Truck size={18} class="text-white" />
				</div>
				<span class="text-white font-bold text-lg tracking-tight">TransitOps</span>
			</div>
			<div class="flex-1 flex flex-col justify-center">
				<div class="max-w-sm">
					<p class="text-xs font-mono text-blue-400/70 uppercase tracking-[0.2em] mb-4">Fleet Management Platform</p>
					<h2 class="text-3xl font-bold text-white leading-tight mb-6">One platform.<br />Every vehicle,<br />every driver.</h2>
					<div class="space-y-3 text-sm text-slate-300">
						<div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-emerald-400"></div>Real-time fleet visibility</div>
						<div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-emerald-400"></div>Live trip tracking & scheduling</div>
						<div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-emerald-400"></div>Advanced analytics & reporting</div>
						<div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-emerald-400"></div>Role-based access control</div>
					</div>
				</div>
			</div>
			<p class="text-xs text-slate-500 font-mono">© 2026 TransitOps</p>
		</div>
	</div>

	<!-- Right: login form -->
	<div class="flex-1 flex items-center justify-center px-6 py-12 bg-background">
		<div class="w-full max-w-sm">
			<!-- Mobile logo -->
			<div class="flex items-center gap-2 mb-8 lg:hidden">
				<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<Truck size={15} class="text-white" />
				</div>
				<span class="font-bold text-foreground">TransitOps</span>
			</div>

			<div class="mb-8">
				<h1 class="text-2xl font-bold text-foreground">Sign in</h1>
				<p class="text-sm text-muted-foreground mt-1">Access your fleet management console</p>
			</div>

			<form
				method="POST"
				action="?/login"
				class="space-y-4"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<div class="flex flex-col gap-1.5">
					<label for="email" class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						placeholder="you@company.com"
						class="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="password" class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
					<div class="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required
							placeholder="Enter password"
							class="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{#if showPassword}<EyeOff size={14} />{:else}<Eye size={14} />{/if}
						</button>
					</div>
				</div>

				{#if form?.error}
					<div class="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
						<AlertCircle size={13} />
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
				>
					{#if loading}
						<Loader2 size={14} class="animate-spin" /> Signing in…
					{:else}
						Sign in
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>
