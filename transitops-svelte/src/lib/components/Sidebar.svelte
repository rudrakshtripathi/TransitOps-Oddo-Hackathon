<script lang="ts">
	import {
		LayoutDashboard,
		Truck,
		Users,
		Navigation,
		Wrench,
		Fuel,
		BarChart3,
		Settings,
		User
	} from 'lucide-svelte';
	import { NAV, type Role } from '$lib/data';
	import { cn } from '$lib/utils';

	let {
		active,
		collapsed,
		role,
		onnav
	}: { active: string; collapsed: boolean; role: Role; onnav: (id: string) => void } = $props();

	const ICONS: Record<string, any> = {
		LayoutDashboard,
		Truck,
		Users,
		Navigation,
		Wrench,
		Fuel,
		BarChart3,
		Settings
	};

	const userName = $derived(
		role === 'admin' ? 'Alex Kariuki' : role === 'manager' ? 'Beatrice Auma' : 'James Mwangi'
	);
</script>

<aside
	class={cn(
		'h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 flex-shrink-0',
		collapsed ? 'w-16' : 'w-56'
	)}
>
	<div class="px-4 py-4 flex items-center gap-3 border-b border-sidebar-border h-14">
		<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
			<Truck size={15} class="text-white" />
		</div>
		{#if !collapsed}
			<span
				class="font-bold text-sm font-outfit text-sidebar-foreground tracking-tight whitespace-nowrap"
			>
				TransitOps
			</span>
		{/if}
	</div>

	<nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
		{#each NAV as item (item.id)}
			{#if item.isDivider}
				{#if !collapsed}
					<div class="px-3 pt-4 pb-1">
						<span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
							{item.label}
						</span>
					</div>
				{/if}
			{:else}
				{@const Icon = ICONS[item.icon!]}
				{@const isActive = active === item.id}
				<button
					onclick={() => onnav(item.id)}
					title={collapsed ? item.label : undefined}
					class={cn(
						'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
						collapsed ? 'justify-center' : 'justify-start',
						isActive
							? 'bg-sidebar-accent text-sidebar-primary font-medium'
							: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
					)}
				>
					<Icon size={15} class="flex-shrink-0" />
					{#if !collapsed}
						<span class="text-sm">{item.label}</span>
					{/if}
				</button>
			{/if}
		{/each}
	</nav>

	{#if !collapsed}
		<div class="px-3 py-3 border-t border-sidebar-border">
			<div class="flex items-center gap-3 px-2 py-2 rounded-lg">
				<div
					class="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
				>
					<User size={13} class="text-primary" />
				</div>
				<div class="min-w-0">
					<div class="text-xs font-medium text-sidebar-foreground truncate">{userName}</div>
					<div class="text-[10px] text-muted-foreground capitalize font-dm-mono">{role}</div>
				</div>
			</div>
		</div>
	{/if}
</aside>
