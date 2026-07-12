<script lang="ts">
	import { page } from '$app/state';
	import { ModeWatcher } from 'mode-watcher';
	import { Sun, Moon, Menu } from '@lucide/svelte';
	import type { DbUser } from '$lib/types';

	let { user, ontoggleSidebar }: { user: DbUser; ontoggleSidebar: () => void } = $props();

	// Derive a human-readable page title from the current path
	const pageTitle = $derived(() => {
		const p = page.url.pathname;
		if (p === '/app') return 'Dashboard';
		if (p.startsWith('/app/vehicles')) return 'Vehicles';
		if (p.startsWith('/app/drivers')) return 'Drivers';
		if (p.startsWith('/app/trips')) return 'Trips';
		if (p.startsWith('/app/maintenance')) return 'Maintenance';
		if (p.startsWith('/app/expenses')) return 'Expenses';
		return 'TransitOps';
	});
</script>

<header class="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0">
	<button onclick={ontoggleSidebar} class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Toggle sidebar">
		<Menu size={18} />
	</button>

	<h1 class="text-sm font-semibold text-foreground flex-1">{pageTitle()}</h1>

	<div class="flex items-center gap-2">
		<ModeWatcher />
		<div class="text-xs text-muted-foreground font-medium hidden sm:block">{user.role}</div>
		<div class="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
			{user.email.charAt(0).toUpperCase()}
		</div>
	</div>
</header>
