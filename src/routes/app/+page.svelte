<script lang="ts">
	import StatCard from '$lib/components/StatCard.svelte';
	import { VehicleStatus, DriverStatus, TripStatus } from '$lib/constants';
	import { Truck, Users, Route, Wrench } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const activeVehicles = $derived(data.vehicleStats[VehicleStatus.AVAILABLE] ?? 0);
	const onTripVehicles = $derived(data.vehicleStats[VehicleStatus.ON_TRIP] ?? 0);
	const activeDrivers = $derived(data.driverStats[DriverStatus.AVAILABLE] ?? 0);
	const activeTrips = $derived(data.tripStats[TripStatus.DISPATCHED] ?? 0);
</script>

<svelte:head>
	<title>Dashboard — TransitOps</title>
</svelte:head>

<div class="space-y-6">
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<StatCard label="Available Vehicles" value={activeVehicles} sub="{onTripVehicles} on trip" icon={Truck} color="bg-blue-600" />
		<StatCard label="Available Drivers" value={activeDrivers} icon={Users} color="bg-violet-600" />
		<StatCard label="Active Trips" value={activeTrips} icon={Route} color="bg-emerald-600" />
		<StatCard label="Open Maintenance" value={data.openMaintenanceCount} icon={Wrench} color="bg-amber-600" />
	</div>

	<div class="bg-card border border-border rounded-xl p-5">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-sm font-semibold text-foreground">Recent Trips</h3>
			<a href="/app/trips" class="text-xs text-primary hover:underline">View all →</a>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border">
						{#each ['Route', 'Status', 'Created'] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest pb-2 pr-4">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each data.recentTrips as trip (trip.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="py-2.5 pr-4">
								<p class="font-medium text-foreground text-xs">{trip.source} → {trip.destination}</p>
							</td>
							<td class="py-2.5 pr-4">
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
									{trip.status === TripStatus.DISPATCHED ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
									 trip.status === TripStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
									 trip.status === TripStatus.CANCELLED ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
									 'bg-muted text-muted-foreground'}"
								>{trip.status}</span>
							</td>
							<td class="py-2.5 text-xs text-muted-foreground font-mono">{new Date(trip.createdAt).toLocaleDateString()}</td>
						</tr>
					{:else}
						<tr><td colspan="3" class="py-10 text-center text-sm text-muted-foreground">No trips yet</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
