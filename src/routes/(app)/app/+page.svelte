<script lang="ts">
	import { Truck, Users, Navigation, DollarSign, Download, AlertTriangle } from '@lucide/svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import RevenueAreaChart from '$lib/components/charts/RevenueAreaChart.svelte';
	import FleetStatusPie from '$lib/components/charts/FleetStatusPie.svelte';
	import WeeklyDistanceBar from '$lib/components/charts/WeeklyDistanceBar.svelte';
	import { getVehicles } from '$lib/api/vehicles.remote';
	import { getDrivers } from '$lib/api/drivers.remote';
	import { getTrips } from '$lib/api/trips.remote';
	import { getMaintenanceLogs } from '$lib/api/maintenance.remote';
	import { getExpenses } from '$lib/api/fuel.remote';
	import { VEHICLE_PIE, BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from '$lib/data';

	// Load all dashboard metrics reactively
	let dashboardPromise = $state(Promise.all([
		getVehicles(),
		getDrivers(),
		getTrips(),
		getMaintenanceLogs(),
		getExpenses()
	]));
</script>

<div class="space-y-6">
	<svelte:boundary>
		{#await dashboardPromise}
			<div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
				Loading dashboard metrics...
			</div>
		{:then [vehiclesRes, driversRes, tripsRes, logsRes, expensesRes]}
			{#if vehiclesRes.error || driversRes.error || tripsRes.error || logsRes.error || expensesRes.error}
				<div class="py-16 text-center text-sm text-destructive bg-destructive/10 border rounded-xl">
					Error loading dashboard data
				</div>
			{:else}
				{@const vehicles = vehiclesRes.data || []}
				{@const drivers = driversRes.data || []}
				{@const trips = tripsRes.data || []}
				{@const logs = logsRes.data || []}
				{@const expenses = expensesRes.data || []}

				{@const activeVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'idle').length}
				{@const idleVehicles = vehicles.filter(v => v.status === 'idle').length}
				{@const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length}

				{@const activeDrivers = drivers.filter(d => d.status === 'active').length}
				{@const leaveDrivers = drivers.filter(d => d.status === 'on_leave').length}
				{@const inactiveDrivers = drivers.filter(d => d.status === 'inactive').length}

				{@const totalSpend = expenses.reduce((s, e) => s + Number(e.cost), 0)}
				{@const alerts = logs.filter((m) => m.status !== 'completed' && (m.description.includes('high') || m.description.includes('critical') || m.description.includes('overdue')))}

				<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						label="Active Vehicles"
						value={`${activeVehicles} / ${vehicles.length}`}
						sub={`${idleVehicles} idle · ${maintenanceVehicles} maintenance`}
						trend={12}
						icon={Truck}
						color="bg-blue-600"
					/>
					<StatCard
						label="Active Drivers"
						value={`${activeDrivers} / ${drivers.length}`}
						sub={`${leaveDrivers} on leave · ${inactiveDrivers} inactive`}
						trend={8}
						icon={Users}
						color="bg-violet-600"
					/>
					<StatCard
						label="Trips This Month"
						value={String(trips.length)}
						sub={`${trips.filter(t => t.status === 'in_progress').length} in progress`}
						trend={15}
						icon={Navigation}
						color="bg-emerald-600"
					/>
					<StatCard
						label="Total Fuel Spend"
						value={`KES ${(totalSpend / 1000).toFixed(1)}K`}
						sub="Target: KES 5.8M"
						trend={-5}
						icon={DollarSign}
						color="bg-amber-600"
					/>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
					<div class="lg:col-span-2 bg-card border border-border rounded-xl p-5">
						<div class="flex items-center justify-between mb-4">
							<div>
								<h3 class="text-sm font-semibold font-outfit text-card-foreground">Revenue & Fuel Cost</h3>
								<p class="text-xs text-muted-foreground font-dm-mono">Aug 2025 — Jan 2026 (KES thousands)</p>
							</div>
							<Button variant="ghost" size="sm"><Download class="size-3 mr-1" /> Export</Button>
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
							<a href="/app/trips" class="text-xs text-primary cursor-pointer hover:underline">View all</a>
						</div>
						<div class="space-y-2">
							{#if trips.length === 0}
								<div class="text-xs text-muted-foreground py-8 text-center">No recent dispatches logged</div>
							{:else}
								{#each trips.slice(0, 4) as t (t.id)}
									<div class="flex items-center justify-between py-2 border-b border-border last:border-0">
										<div class="min-w-0">
											<p class="text-xs font-medium text-foreground truncate">{t.source} → {t.destination}</p>
											<p class="text-[10px] text-muted-foreground font-dm-mono">{t.driverName} · {t.vehiclePlate}</p>
										</div>
										<Badge variant="outline" class={BADGE_STYLES[t.status as BadgeVariant]}>
											{BADGE_LABELS[t.status as BadgeVariant]}
										</Badge>
									</div>
								{/each}
							{/if}
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
									<span class="text-red-700 dark:text-red-300">{m.vehiclePlate} — {m.description.split(' (')[0]}</span>
									<span class="font-dm-mono text-red-500">Scheduled: {new Date(m.dateLogged).toLocaleDateString()}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		{/await}

		{#snippet pending()}
			<div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
				Loading...
			</div>
		{/snippet}

		{#snippet failed(error: any, reset: any)}
			<div class="py-16 text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
				<p>Failed to load dashboard: {error?.message || error}</p>
				<Button variant="outline" size="sm" onclick={reset}>Retry</Button>
			</div>
		{/snippet}
	</svelte:boundary>
</div>
