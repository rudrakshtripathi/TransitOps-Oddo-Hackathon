<script lang="ts">
	import { page } from '$app/state';
	import { UserRole } from '$lib/constants';
	import type { DbUser } from '$lib/types';
	import type { Component } from 'svelte';
	import {
		LayoutDashboard, Truck, Users, Route, Wrench,
		Receipt, ChevronLeft, ChevronRight, LogOut
	} from '@lucide/svelte';
	import { enhance } from '$app/forms';

	let { user, collapsed = false, ontoggle }: {
		user: DbUser;
		collapsed?: boolean;
		ontoggle?: () => void;
	} = $props();

	type NavItem = { href: string; label: string; icon: Component<any>; roles: UserRole[] };

	const navItems: NavItem[] = [
		{ href: '/app', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST] },
		{ href: '/app/vehicles', label: 'Vehicles', icon: Truck, roles: [UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST] },
		{ href: '/app/drivers', label: 'Drivers', icon: Users, roles: [UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER] },
		{ href: '/app/trips', label: 'Trips', icon: Route, roles: [UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST] },
		{ href: '/app/maintenance', label: 'Maintenance', icon: Wrench, roles: [UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER] },
		{ href: '/app/expenses', label: 'Expenses', icon: Receipt, roles: [UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST] },
	];

	const visibleItems = $derived(navItems.filter(item => item.roles.includes(user.role as UserRole)));
	const currentPath = $derived(page.url.pathname);
</script>

<aside class="{collapsed ? 'w-16' : 'w-60'} flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-200 shrink-0">
	<!-- Logo -->
	<div class="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border">
		<div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
			<Truck size={14} class="text-white" />
		</div>
		{#if !collapsed}
			<span class="font-bold text-sidebar-foreground text-sm tracking-tight">TransitOps</span>
		{/if}
	</div>

	<!-- Nav items -->
	<nav class="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
		{#each visibleItems as item (item.href)}
			{@const isActive = currentPath === item.href || (item.href !== '/app' && currentPath.startsWith(item.href))}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors {isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
				title={collapsed ? item.label : undefined}
			>
				<Icon size={16} class="shrink-0" />
				{#if !collapsed}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Footer: user info + logout -->
	<div class="border-t border-sidebar-border p-3 space-y-1">
		{#if !collapsed}
			<div class="px-2 py-1">
				<p class="text-xs font-medium text-sidebar-foreground truncate">{user.email}</p>
				<p class="text-[10px] text-muted-foreground truncate">{user.role}</p>
			</div>
		{/if}
		<form method="POST" action="/auth?/logout" use:enhance>
			<button type="submit" class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors" title={collapsed ? 'Sign out' : undefined}>
				<LogOut size={16} class="shrink-0" />
				{#if !collapsed}<span>Sign out</span>{/if}
			</button>
		</form>
		<button onclick={ontoggle} class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground transition-colors" aria-label="Toggle sidebar">
			{#if collapsed}
				<ChevronRight size={16} class="shrink-0 mx-auto" />
			{:else}
				<ChevronLeft size={16} class="shrink-0" />
				<span>Collapse</span>
			{/if}
		</button>
	</div>
</aside>
