<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { LayoutDashboard, Truck, Menu, X } from '@lucide/svelte';
	import AccountDropdown from '$lib/components/reusable/AccountDropdown.svelte';
	import ColorModeToggle from '$lib/components/reusable/ColorModeToggle.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data, children } = $props();
	let { session, user, supabase } = $derived(data);

	let mobileMenuOpen = $state(false);

	const navItems = [
		{ name: 'Dashboard', href: '/app', icon: LayoutDashboard },
		{ name: 'Vehicles', href: '/app/vehicles', icon: Truck }
	];
</script>

<div class="min-h-screen bg-background flex flex-col md:flex-row">
	<!-- Sidebar for Desktop -->
	<aside class="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0">
		<div class="h-16 flex items-center px-6 border-b border-border">
			<a href="/app" class="flex items-center gap-2">
				<span class="text-xl font-bold tracking-tight text-foreground font-heading">TransitOps</span>
			</a>
		</div>
		<nav class="flex-1 p-4 space-y-1">
			{#each navItems as item}
				{@const active = page.url.pathname === item.href}
				<a
					href={item.href}
					class={[
						'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
						active
							? 'bg-primary/10 text-primary font-semibold'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'
					]}
				>
					<item.icon class="size-4" />
					{item.name}
				</a>
			{/each}
		</nav>
		<div class="p-4 border-t border-border flex flex-col gap-2">
			{#if session && user}
				<div class="flex items-center justify-between gap-2">
					<AccountDropdown {session} {user} {supabase} />
					<ColorModeToggle />
				</div>
			{/if}
		</div>
	</aside>

	<!-- Mobile Header -->
	<header class="md:hidden h-16 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
		<a href="/app" class="flex items-center gap-2">
			<span class="text-lg font-bold tracking-tight text-foreground font-heading">TransitOps</span>
		</a>
		<div class="flex items-center gap-2">
			<ColorModeToggle />
			{#if session && user}
				<AccountDropdown {session} {user} {supabase} />
			{/if}
			<Button variant="ghost" size="icon" onclick={() => mobileMenuOpen = !mobileMenuOpen}>
				{#if mobileMenuOpen}
					<X class="size-5" />
				{:else}
					<Menu class="size-5" />
				{/if}
			</Button>
		</div>
	</header>

	<!-- Mobile Nav Drawer -->
	{#if mobileMenuOpen}
		<div class="md:hidden border-b border-border bg-card">
			<nav class="p-4 space-y-1">
				{#each navItems as item}
					{@const active = page.url.pathname === item.href}
					<a
						href={item.href}
						onclick={() => mobileMenuOpen = false}
						class={[
							'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
							active
								? 'bg-primary/10 text-primary font-semibold'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'
						]}
					>
						<item.icon class="size-4" />
						{item.name}
					</a>
				{/each}
			</nav>
		</div>
	{/if}

	<!-- Main Content Area -->
	<main class="flex-1 overflow-y-auto p-4 md:p-8">
		{@render children?.()}
	</main>
</div>
