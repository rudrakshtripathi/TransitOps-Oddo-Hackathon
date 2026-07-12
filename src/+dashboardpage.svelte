<script lang="ts">
	import { Truck, Users, Navigation, DollarSign, Download, AlertTriangle } from 'lucide-svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import RevenueAreaChart from '$lib/components/charts/RevenueAreaChart.svelte';
	import FleetStatusPie from '$lib/components/charts/FleetStatusPie.svelte';
	import WeeklyDistanceBar from '$lib/components/charts/WeeklyDistanceBar.svelte';
	import { TRIPS_DATA, MAINTENANCE_DATA, VEHICLE_PIE, type BadgeVariant } from '$lib/data';

	const alerts = MAINTENANCE_DATA.filter((m) => m.status === 'overdue' || m.priority === 'critical');
</script>

<div class="space-y-6">
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<StatCard label="Active Vehicles" value="4 / 8" sub="2 idle · 1 maintenance" trend={12} icon={Truck} color="bg-blue-600" />
		<StatCard label="Active Drivers" value="5 / 7" sub="1 on leave · 1 inactive" trend={8} icon={Users} color="bg-violet-600" />
		<StatCard label="Trips This Month" value="94" sub="2 in progress" trend={-18} icon={Navigation} color="bg-emerald-600" />
		<StatCard label="Revenue (Jan)" value="KES 1.45M" sub="Target: KES 5.8M" trend={-21} icon={DollarSign} color="bg-amber-600" />
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<div class="lg:col-span-2 bg-card border border-border rounded-xl p-5">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h3 class="text-sm font-semibold font-outfit text-card-foreground">Revenue & Fuel Cost</h3>
					<p class="text-xs text-muted-foreground font-dm-mono">Aug 2025 — Jan 2026 (KES thousands)</p>
				</div>
				<Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
			</div>
			<RevenueAreaChart />
		</div>

		<div class="bg-card border border-border rounded-xl p-5">
			<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Fleet Status</h3>
			<FleetStatusPie />
			<div class="space-y-2 mt-2">
				{#each VEHICLE_PIE as item (item.name)}
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 rounded-full" style="background:{item.color}"></div>
							<span class="text-muted-foreground">{item.name}</span>
						</div>
						<span class="font-dm-mono font-medium text-foreground">{item.value}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<div class="bg-card border border-border rounded-xl p-5">
			<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Weekly Distance (km)</h3>
			<WeeklyDistanceBar />
		</div>

		<div class="bg-card border border-border rounded-xl p-5">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-sm font-semibold font-outfit text-card-foreground">Recent Trips</h3>
				<a href="/trips" class="text-xs text-primary cursor-pointer hover:underline">View all</a>
			</div>
			<div class="space-y-2">
				{#each TRIPS_DATA.slice(0, 4) as t (t.id)}
					<div class="flex items-center justify-between py-2 border-b border-border last:border-0">
						<div class="min-w-0">
							<p class="text-xs font-medium text-foreground truncate">{t.route}</p>
							<p class="text-[10px] text-muted-foreground font-dm-mono">{t.driver} · {t.vehicle}</p>
						</div>
						<Badge status={t.status as BadgeVariant} />
					</div>
				{/each}
			</div>
		</div>
	</div>

	{#if alerts.length > 0}
		<div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
			<div class="flex items-center gap-2 mb-3">
				<AlertTriangle size={14} class="text-red-500" />
				<span class="text-sm font-semibold text-red-700 dark:text-red-400">Maintenance Alerts</span>
			</div>
			<div class="space-y-2">
				{#each alerts as m (m.id)}
					<div class="flex items-center justify-between text-xs">
						<span class="text-red-700 dark:text-red-300">{m.vehicle} — {m.type}</span>
						<span class="font-dm-mono text-red-500">Scheduled: {m.scheduled}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>