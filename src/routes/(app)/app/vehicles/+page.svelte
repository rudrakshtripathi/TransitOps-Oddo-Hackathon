<script lang="ts">
	import { Plus, Search, Download, Edit, Trash2, AlertTriangle, Check } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NativeSelect } from '$lib/components/ui/native-select';
	import * as Dialog from '$lib/components/ui/dialog';

	// Static local data since we don't have a backend data file yet
	const INITIAL_VEHICLES = [
		{ id: 'V001', plate: 'KAA 123A', make: 'Toyota', model: 'HiAce', year: 2020, type: 'Van', capacity: 14, status: 'active', fuel: 'Diesel', driver: 'John Doe', mileage: 124500, lastService: '2026-05-12' },
		{ id: 'V002', plate: 'KAB 456B', make: 'Isuzu', model: 'NQR', year: 2018, type: 'Truck', capacity: 33, status: 'idle', fuel: 'Diesel', driver: 'Jane Smith', mileage: 218700, lastService: '2026-04-01' },
		{ id: 'V003', plate: 'KAC 789C', make: 'Mitsubishi', model: 'Fuso', year: 2019, type: 'Truck', capacity: 28, status: 'maintenance', fuel: 'Diesel', driver: '—', mileage: 189200, lastService: '2026-06-25' },
		{ id: 'V004', plate: 'KAD 012D', make: 'Toyota', model: 'Coaster', year: 2021, type: 'Bus', capacity: 29, status: 'active', fuel: 'Diesel', driver: 'David Kimani', mileage: 98400, lastService: '2026-05-20' },
		{ id: 'V005', plate: 'KAE 345E', make: 'Nissan', model: 'Urvan', year: 2017, type: 'Van', capacity: 14, status: 'retired', fuel: 'Petrol', driver: '—', mileage: 310500, lastService: '2025-11-15' }
	];

	let vehicles = $state([...INITIAL_VEHICLES]);
	let search = $state('');
	let filterType = $state('all');
	let filterStatus = $state('all');
	let modalOpen = $state(false);
	let deleteModalOpen = $state(false);
	let editId = $state<string | null>(null);
	let deleteId = $state<string | null>(null);

	const emptyForm = { plate: '', make: '', model: '', year: '2024', type: 'Van', capacity: '15', status: 'active', fuel: 'Diesel' };
	let form = $state({ ...emptyForm });

	const filtered = $derived(
		vehicles.filter((v) => {
			const q = search.toLowerCase();
			const matchSearch =
				!q ||
				v.plate.toLowerCase().includes(q) ||
				v.make.toLowerCase().includes(q) ||
				v.model.toLowerCase().includes(q) ||
				v.driver.toLowerCase().includes(q);
			const matchType = filterType === 'all' || v.type === filterType;
			const matchStatus = filterStatus === 'all' || v.status === filterStatus;
			return matchSearch && matchType && matchStatus;
		})
	);

	function openAdd() {
		editId = null;
		form = { ...emptyForm };
		modalOpen = true;
	}

	function openEdit(v: (typeof INITIAL_VEHICLES)[0]) {
		editId = v.id;
		form = { plate: v.plate, make: v.make, model: v.model, year: String(v.year), type: v.type, capacity: String(v.capacity), status: v.status, fuel: v.fuel };
		modalOpen = true;
	}

	function handleSave() {
		if (!form.plate || !form.make || !form.model) return;
		if (editId) {
			vehicles = vehicles.map((v) =>
				v.id === editId
					? { ...v, ...form, year: Number(form.year), capacity: Number(form.capacity) }
					: v
			);
		} else {
			vehicles = [
				{
					...form,
					id: `V${String(vehicles.length + 1).padStart(3, '0')}`,
					year: Number(form.year),
					capacity: Number(form.capacity),
					driver: '—',
					mileage: 0,
					lastService: '—'
				},
				...vehicles
			];
		}
		modalOpen = false;
	}

	function triggerDelete(id: string) {
		deleteId = id;
		deleteModalOpen = true;
	}

	function confirmDelete() {
		if (deleteId) {
			vehicles = vehicles.filter((v) => v.id !== deleteId);
			deleteId = null;
		}
		deleteModalOpen = false;
	}

	function getStatusBadge(status: string) {
		switch (status.toLowerCase()) {
			case 'active':
				return { variant: 'default' as const, class: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15' };
			case 'idle':
				return { variant: 'secondary' as const, class: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25 hover:bg-blue-500/15' };
			case 'maintenance':
				return { variant: 'destructive' as const, class: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20' };
			case 'retired':
				return { variant: 'outline' as const, class: 'bg-muted text-muted-foreground border-muted hover:bg-muted/80' };
			default:
				return { variant: 'outline' as const, class: '' };
		}
	}
</script>

<svelte:head>
	<title>Vehicles | TransitOps</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-foreground font-heading">Vehicle Fleet</h1>
			<p class="text-sm text-muted-foreground">{vehicles.length} registered vehicles</p>
		</div>
		<Button variant="default" size="sm" onclick={openAdd}>
			<Plus class="mr-2 size-4" />
			Add Vehicle
		</Button>
	</div>

	<!-- Filters & Actions -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="flex items-center gap-2 border rounded-lg px-3 py-1.5 flex-1 min-w-[200px] bg-card">
			<Search class="size-4 text-muted-foreground" />
			<input
				bind:value={search}
				placeholder="Search vehicles plate, model, driver..."
				class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
			/>
		</div>

		<div class="flex items-center gap-2">
			<Label class="text-xs text-muted-foreground font-medium">Type:</Label>
			<NativeSelect bind:value={filterType} class="bg-card w-32">
				<option value="all">All Types</option>
				<option value="Bus">Bus</option>
				<option value="Truck">Truck</option>
				<option value="Van">Van</option>
			</NativeSelect>
		</div>

		<div class="flex items-center gap-2">
			<Label class="text-xs text-muted-foreground font-medium">Status:</Label>
			<NativeSelect bind:value={filterStatus} class="bg-card w-36">
				<option value="all">All Status</option>
				<option value="active">Active</option>
				<option value="idle">Idle</option>
				<option value="maintenance">Maintenance</option>
				<option value="retired">Retired</option>
			</NativeSelect>
		</div>

		<Button variant="outline" size="sm" class="ml-auto">
			<Download class="mr-2 size-4" />
			Export
		</Button>
	</div>

	<!-- Fleet Table -->
	<div class="bg-card border rounded-xl overflow-hidden shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/40">
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">ID</th>
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Plate</th>
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Vehicle</th>
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Type</th>
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Status</th>
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Driver</th>
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Mileage</th>
						<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Last Service</th>
						<th class="w-20 px-4 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#if filtered.length === 0}
						<tr>
							<td colspan="9" class="py-16 text-center text-sm text-muted-foreground bg-muted/10">
								No vehicles match your filters
							</td>
						</tr>
					{:else}
						{#each filtered as v (v.id)}
							{@const badgeInfo = getStatusBadge(v.status)}
							<tr class="hover:bg-muted/30 transition-colors">
								<td class="px-4 py-3 font-mono text-xs text-muted-foreground">{v.id}</td>
								<td class="px-4 py-3 font-mono text-xs font-semibold text-foreground">{v.plate}</td>
								<td class="px-4 py-3">
									<div class="font-medium text-foreground text-xs">{v.make} {v.model}</div>
									<div class="text-[10px] text-muted-foreground">{v.year} · {v.fuel}</div>
								</td>
								<td class="px-4 py-3 text-xs text-muted-foreground">{v.type}</td>
								<td class="px-4 py-3">
									<Badge variant={badgeInfo.variant} class={badgeInfo.class}>
										{v.status}
									</Badge>
								</td>
								<td class="px-4 py-3 text-xs text-foreground">{v.driver}</td>
								<td class="px-4 py-3 text-xs font-mono text-foreground">{v.mileage.toLocaleString()} km</td>
								<td class="px-4 py-3 text-xs font-mono text-muted-foreground">{v.lastService}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-1">
										<Button variant="ghost" size="icon" class="size-7" onclick={() => openEdit(v)}>
											<Edit class="size-3.5" />
											<span class="sr-only">Edit</span>
										</Button>
										<Button variant="ghost" size="icon" class="size-7 text-destructive hover:bg-destructive/10" onclick={() => triggerDelete(v.id)}>
											<Trash2 class="size-3.5" />
											<span class="sr-only">Delete</span>
										</Button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t text-xs text-muted-foreground font-mono bg-muted/10">
			Showing {filtered.length} of {vehicles.length} vehicles
		</div>
	</div>

	<!-- Add / Edit Modal -->
	<Dialog.Root bind:open={modalOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</Dialog.Title>
			</Dialog.Header>
			<div class="grid gap-4 py-2">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<Label for="plate" class="text-xs">License Plate *</Label>
						<Input id="plate" bind:value={form.plate} placeholder="KAA 123A" />
					</div>
					<div class="space-y-1.5">
						<Label for="year" class="text-xs">Year</Label>
						<Input id="year" type="number" bind:value={form.year} />
					</div>
					<div class="space-y-1.5">
						<Label for="make" class="text-xs">Make *</Label>
						<Input id="make" bind:value={form.make} placeholder="Toyota" />
					</div>
					<div class="space-y-1.5">
						<Label for="model" class="text-xs">Model *</Label>
						<Input id="model" bind:value={form.model} placeholder="HiAce" />
					</div>
					<div class="space-y-1.5">
						<Label for="type" class="text-xs">Type</Label>
						<NativeSelect id="type" bind:value={form.type} class="w-full">
							<option value="Bus">Bus</option>
							<option value="Truck">Truck</option>
							<option value="Van">Van</option>
							<option value="Car">Car</option>
						</NativeSelect>
					</div>
					<div class="space-y-1.5">
						<Label for="capacity" class="text-xs">Capacity (seats)</Label>
						<Input id="capacity" type="number" bind:value={form.capacity} />
					</div>
					<div class="space-y-1.5">
						<Label for="fuel" class="text-xs">Fuel Type</Label>
						<NativeSelect id="fuel" bind:value={form.fuel} class="w-full">
							<option value="Diesel">Diesel</option>
							<option value="Petrol">Petrol</option>
							<option value="Electric">Electric</option>
							<option value="Hybrid">Hybrid</option>
						</NativeSelect>
					</div>
					<div class="space-y-1.5">
						<Label for="status" class="text-xs">Status</Label>
						<NativeSelect id="status" bind:value={form.status} class="w-full">
							<option value="active">Active</option>
							<option value="idle">Idle</option>
							<option value="maintenance">Maintenance</option>
							<option value="retired">Retired</option>
						</NativeSelect>
					</div>
				</div>
			</div>
			<div class="flex gap-3 mt-4">
				<Button class="flex-1" onclick={handleSave}>
					<Check class="mr-2 size-4" />
					{editId ? 'Save Changes' : 'Add Vehicle'}
				</Button>
				<Button variant="secondary" onclick={() => (modalOpen = false)}>
					Cancel
				</Button>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Delete Dialog -->
	<Dialog.Root bind:open={deleteModalOpen}>
		<Dialog.Content class="sm:max-w-[400px]">
			<Dialog.Header>
				<Dialog.Title>Delete Vehicle</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4">
				<div class="flex items-start gap-3 p-3 bg-destructive/10 text-destructive border rounded-xl border-destructive/20 text-sm">
					<AlertTriangle class="size-5 shrink-0 mt-0.5" />
					<p>This action cannot be undone. The vehicle record and associated telemetry will be permanently deleted.</p>
				</div>
				<div class="flex gap-3">
					<Button variant="destructive" class="flex-1" onclick={confirmDelete}>
						<Trash2 class="mr-2 size-4" />
						Confirm Delete
					</Button>
					<Button variant="secondary" onclick={() => (deleteModalOpen = false)}>
						Cancel
					</Button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
