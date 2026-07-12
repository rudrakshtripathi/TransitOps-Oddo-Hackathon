<script lang="ts">
	import { enhance } from '$app/forms';
	import { Truck, Plus, Search, Edit2, Trash2, Check, X, AlertTriangle } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { VehicleStatus } from '$lib/constants';
	import { toNum } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let search = $state('');
	let filterStatus = $state('all');
	let modalOpen = $state(false);
	let deleteId = $state<string | null>(null);
	let editVehicle = $state<typeof data.vehicles[0] | null>(null);
	let submitting = $state(false);

	const filtered = $derived(
		data.vehicles.filter(v => {
			const q = search.toLowerCase();
			const matchQ = !q || v.registrationNumber.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.type.toLowerCase().includes(q);
			const matchS = filterStatus === 'all' || v.status === filterStatus;
			return matchQ && matchS;
		})
	);

	const statusColors: Record<string, string> = {
		[VehicleStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
		[VehicleStatus.ON_TRIP]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
		[VehicleStatus.IN_SHOP]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
		[VehicleStatus.RETIRED]: 'bg-muted text-muted-foreground'
	};

	function openAdd() {
		editVehicle = null;
		modalOpen = true;
	}

	function openEdit(v: typeof data.vehicles[0]) {
		editVehicle = v;
		modalOpen = true;
	}

	// Close modal after successful form action
	$effect(() => {
		if (form?.success) {
			modalOpen = false;
			deleteId = null;
		}
	});
</script>

<svelte:head><title>Vehicles — TransitOps</title></svelte:head>

<PageHeader title="Vehicle Fleet" description="{data.vehicles.length} registered vehicles">
	{#snippet children()}
		<Button size="sm" onclick={openAdd}><Plus size={14} class="mr-1" />Add Vehicle</Button>
	{/snippet}
</PageHeader>

<!-- Filters -->
<div class="flex flex-wrap items-center gap-3 mb-5">
	<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
		<Search size={13} class="text-muted-foreground shrink-0" />
		<input bind:value={search} placeholder="Search vehicles…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
	</div>
	<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
		<option value="all">All Status</option>
		{#each Object.values(VehicleStatus) as s (s)}
			<option value={s}>{s}</option>
		{/each}
	</select>
</div>

<!-- Table -->
<div class="bg-card border border-border rounded-xl overflow-hidden">
	{#if filtered.length === 0}
		<EmptyState message="No vehicles match your filters" icon={Truck} />
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['Registration', 'Name / Type', 'Capacity', 'Status', 'Odometer', ''] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as v (v.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 font-mono text-xs font-medium text-foreground">{v.registrationNumber}</td>
							<td class="px-4 py-3">
								<p class="font-medium text-xs text-foreground">{v.name}</p>
								<p class="text-[10px] text-muted-foreground">{v.type}</p>
							</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{toNum(v.maxLoadCapacity).toLocaleString()} kg</td>
							<td class="px-4 py-3">
								<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium {statusColors[v.status] ?? 'bg-muted text-muted-foreground'}">{v.status}</span>
							</td>
							<td class="px-4 py-3 text-xs font-mono text-muted-foreground">{toNum(v.odometer).toLocaleString()} km</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-1">
									<button onclick={() => openEdit(v)} class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit">
										<Edit2 size={12} />
									</button>
									<button onclick={() => (deleteId = v.id)} class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors" aria-label="Delete">
										<Trash2 size={12} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">Showing {filtered.length} of {data.vehicles.length}</div>
	{/if}
</div>

<!-- Add/Edit Dialog -->
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action={editVehicle ? '?/update' : '?/create'}
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => { await update(); submitting = false; };
			}}
		>
			{#if editVehicle}<input type="hidden" name="id" value={editVehicle.id} />{/if}
			<div class="grid grid-cols-2 gap-4 py-4">
				<div class="flex flex-col gap-1.5">
					<Label for="reg">Registration *</Label>
					<Input id="reg" name="registrationNumber" required value={editVehicle?.registrationNumber ?? ''} placeholder="KAA 123A" />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="vname">Model / Name *</Label>
					<Input id="vname" name="name" required value={editVehicle?.name ?? ''} placeholder="Toyota HiAce" />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="vtype">Type *</Label>
					<select id="vtype" name="type" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each ['Bus', 'Truck', 'Van', 'Car'] as t (t)}
							<option value={t} selected={editVehicle?.type === t}>{t}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cap">Max Load (kg)</Label>
					<Input id="cap" name="maxLoadCapacity" type="number" min="0" value={editVehicle ? toNum(editVehicle.maxLoadCapacity) : ''} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cost">Acquisition Cost</Label>
					<Input id="cost" name="acquisitionCost" type="number" min="0" value={editVehicle ? toNum(editVehicle.acquisitionCost) : ''} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="vstatus">Status</Label>
					<select id="vstatus" name="status" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each Object.values(VehicleStatus) as s (s)}
							<option value={s} selected={editVehicle?.status === s}>{s}</option>
						{/each}
					</select>
				</div>
			</div>
			{#if form?.error}
				<p class="text-xs text-destructive mb-3">{form.error}</p>
			{/if}
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (modalOpen = false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					<Check size={13} class="mr-1" />{editVehicle ? 'Save Changes' : 'Add Vehicle'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirmation dialog -->
<Dialog.Root open={!!deleteId} onOpenChange={(open) => !open && (deleteId = null)}>
	<Dialog.Content class="sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Delete Vehicle</Dialog.Title>
		</Dialog.Header>
		<div class="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20 my-2">
			<AlertTriangle size={16} class="text-destructive shrink-0 mt-0.5" />
			<p class="text-sm text-destructive">This action cannot be undone.</p>
		</div>
		<form method="POST" action="?/delete" use:enhance={() => {
			return async ({ update }) => { await update(); };
		}}>
			<input type="hidden" name="id" value={deleteId} />
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteId = null)}>Cancel</Button>
				<Button variant="destructive" type="submit"><Trash2 size={13} class="mr-1" />Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
