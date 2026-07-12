<script lang="ts">
	import { enhance } from '$app/forms';
	import { Route as RouteIcon, Plus, Check, Play, Square, X, AlertTriangle } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { TripStatus } from '$lib/constants';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let filterStatus = $state('all');
	let modalOpen = $state(false);
	let submitting = $state(false);
	
	const filtered = $derived(
		data.trips.filter(t => {
			return filterStatus === 'all' || t.status === filterStatus;
		})
	);

	const statusColors: Record<string, string> = {
		[TripStatus.DRAFT]: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
		[TripStatus.DISPATCHED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
		[TripStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
		[TripStatus.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
	};

	$effect(() => {
		if (form?.success) {
			modalOpen = false;
		}
	});
</script>

<svelte:head><title>Trips — TransitOps</title></svelte:head>

<PageHeader title="Trips" description="{data.trips.length} total trips">
	{#snippet children()}
		<Button size="sm" onclick={() => modalOpen = true}><Plus size={14} class="mr-1" />Add Trip</Button>
	{/snippet}
</PageHeader>

<div class="flex flex-wrap items-center gap-3 mb-5">
	<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
		<option value="all">All Status</option>
		{#each Object.values(TripStatus) as s (s)}
			<option value={s}>{s}</option>
		{/each}
	</select>
</div>

<div class="bg-card border border-border rounded-xl overflow-hidden">
	{#if filtered.length === 0}
		<EmptyState message="No trips match your filters" icon={RouteIcon} />
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['Route', 'Vehicle ID', 'Driver ID', 'Status', 'Created', 'Actions'] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as t (t.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 font-medium text-xs text-foreground">{t.source} → {t.destination}</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{t.vehicleId.slice(0,8)}...</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{t.driverId.slice(0,8)}...</td>
							<td class="px-4 py-3">
								<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium {statusColors[t.status] ?? 'bg-muted text-muted-foreground'}">{t.status}</span>
							</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{new Date(t.createdAt).toLocaleDateString()}</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-1">
									{#if t.status === TripStatus.DRAFT}
										<form method="POST" action="?/dispatch" use:enhance>
											<input type="hidden" name="id" value={t.id} />
											<button type="submit" class="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-colors" title="Dispatch">
												<Play size={12} />
											</button>
										</form>
									{/if}
									{#if t.status === TripStatus.DISPATCHED}
										<form method="POST" action="?/complete" use:enhance>
											<input type="hidden" name="id" value={t.id} />
											<button type="submit" class="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-500 transition-colors" title="Complete">
												<Check size={12} />
											</button>
										</form>
									{/if}
									{#if [TripStatus.DRAFT, TripStatus.DISPATCHED].includes(t.status)}
										<form method="POST" action="?/cancel" use:enhance>
											<input type="hidden" name="id" value={t.id} />
											<button type="submit" class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors" title="Cancel">
												<X size={12} />
											</button>
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">Showing {filtered.length} of {data.trips.length}</div>
	{/if}
</div>

<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Trip</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => { await update(); submitting = false; };
			}}
		>
			<div class="grid grid-cols-2 gap-4 py-4">
				<div class="flex flex-col gap-1.5">
					<Label for="source">Source *</Label>
					<Input id="source" name="source" required />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="destination">Destination *</Label>
					<Input id="destination" name="destination" required />
				</div>
				<div class="flex flex-col gap-1.5 col-span-2">
					<Label for="vehicleId">Vehicle *</Label>
					<select id="vehicleId" name="vehicleId" required class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each data.availableVehicles as v (v.id)}
							<option value={v.id}>{v.registrationNumber} ({v.name})</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5 col-span-2">
					<Label for="driverId">Driver *</Label>
					<select id="driverId" name="driverId" required class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each data.availableDrivers as d (d.id)}
							<option value={d.id}>{d.name} ({d.licenseNumber})</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cargoWeight">Cargo (kg)</Label>
					<Input id="cargoWeight" name="cargoWeight" type="number" min="0" required />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="plannedDistance">Distance (km)</Label>
					<Input id="plannedDistance" name="plannedDistance" type="number" min="0" required />
				</div>
			</div>
			{#if form?.error}
				<p class="text-xs text-destructive mb-3">{form.error}</p>
			{/if}
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (modalOpen = false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					<Check size={13} class="mr-1" />Add Trip
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
