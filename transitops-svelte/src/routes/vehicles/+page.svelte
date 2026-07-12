<script lang="ts">
	import { Plus, Search, Download, Edit2, Trash2, AlertTriangle, Check } from 'lucide-svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import { appState } from '$lib/state/app-state.svelte';
	import { VEHICLES_DATA, type BadgeVariant } from '$lib/data';

	let vehicles = $state(VEHICLES_DATA.map((v) => ({ ...v })));
	let search = $state('');
	let filterType = $state('all');
	let filterStatus = $state('all');
	let modalOpen = $state(false);
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

	const canEdit = $derived(appState.role === 'admin' || appState.role === 'manager');

	function openAdd() {
		editId = null;
		form = { ...emptyForm };
		modalOpen = true;
	}

	function openEdit(v: (typeof VEHICLES_DATA)[0]) {
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

	function handleDelete(id: string) {
		vehicles = vehicles.filter((v) => v.id !== id);
		deleteId = null;
	}
</script>

<div>
	<SectionHeader title="Vehicle Fleet" description={`${vehicles.length} registered vehicles`}>
		{#snippet action()}
			{#if canEdit}
				<Btn variant="primary" size="sm" onclick={openAdd}><Plus size={13} /> Add Vehicle</Btn>
			{/if}
		{/snippet}
	</SectionHeader>

	<div class="flex flex-wrap items-center gap-3 mb-5">
		<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
			<Search size={13} class="text-muted-foreground" />
			<input bind:value={search} placeholder="Search vehicles…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
		</div>
		<select bind:value={filterType} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
			<option value="all">All Types</option>
			{#each ['Bus', 'Truck', 'Van'] as t (t)}<option value={t}>{t}</option>{/each}
		</select>
		<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
			<option value="all">All Status</option>
			{#each ['active', 'idle', 'maintenance', 'retired'] as s (s)}<option value={s}>{s}</option>{/each}
		</select>
		<Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
	</div>

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['ID', 'Plate', 'Vehicle', 'Type', 'Status', 'Driver', 'Mileage', 'Last Service', ''] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#if filtered.length === 0}
						<tr><td colspan="9" class="py-16 text-center text-sm text-muted-foreground">No vehicles match your filters</td></tr>
					{:else}
						{#each filtered as v (v.id)}
							<tr class="hover:bg-muted/30 transition-colors">
								<td class="px-4 py-3 font-dm-mono text-xs text-muted-foreground">{v.id}</td>
								<td class="px-4 py-3 font-dm-mono text-xs font-medium text-foreground">{v.plate}</td>
								<td class="px-4 py-3">
									<div class="font-medium text-foreground text-xs">{v.make} {v.model}</div>
									<div class="text-[10px] text-muted-foreground">{v.year} · {v.fuel}</div>
								</td>
								<td class="px-4 py-3 text-xs text-muted-foreground">{v.type}</td>
								<td class="px-4 py-3"><Badge status={v.status as BadgeVariant} /></td>
								<td class="px-4 py-3 text-xs text-foreground">{v.driver}</td>
								<td class="px-4 py-3 text-xs font-dm-mono text-foreground">{v.mileage.toLocaleString()} km</td>
								<td class="px-4 py-3 text-xs font-dm-mono text-muted-foreground">{v.lastService}</td>
								<td class="px-4 py-3">
									{#if canEdit}
										<div class="flex items-center gap-1">
											<button onclick={() => openEdit(v)} class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={12} /></button>
											<button onclick={() => (deleteId = v.id)} class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
										</div>
									{/if}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-dm-mono">
			Showing {filtered.length} of {vehicles.length} vehicles
		</div>
	</div>

	<Modal open={modalOpen} onClose={() => (modalOpen = false)} title={editId ? 'Edit Vehicle' : 'Add Vehicle'}>
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<FormField label="License Plate *"><Input bind:value={form.plate} placeholder="KAA 123A" /></FormField>
				<FormField label="Year"><Input type="number" bind:value={form.year} /></FormField>
				<FormField label="Make *"><Input bind:value={form.make} placeholder="Toyota" /></FormField>
				<FormField label="Model *"><Input bind:value={form.model} placeholder="HiAce" /></FormField>
				<FormField label="Type">
					<Select bind:value={form.type}>
						{#each ['Bus', 'Truck', 'Van', 'Car'] as t (t)}<option>{t}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Capacity (seats)"><Input type="number" bind:value={form.capacity} /></FormField>
				<FormField label="Fuel Type">
					<Select bind:value={form.fuel}>
						{#each ['Diesel', 'Petrol', 'Electric', 'Hybrid'] as f (f)}<option>{f}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Status">
					<Select bind:value={form.status}>
						{#each ['active', 'idle', 'maintenance', 'retired'] as s (s)}<option value={s}>{s}</option>{/each}
					</Select>
				</FormField>
			</div>
			<div class="flex gap-3 pt-2">
				<Btn variant="primary" class="flex-1" onclick={handleSave}><Check size={13} /> {editId ? 'Save Changes' : 'Add Vehicle'}</Btn>
				<Btn variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Btn>
			</div>
		</div>
	</Modal>

	<Modal open={!!deleteId} onClose={() => (deleteId = null)} title="Delete Vehicle">
		<div class="space-y-4">
			<div class="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
				<AlertTriangle size={18} class="text-red-500 flex-shrink-0 mt-0.5" />
				<p class="text-sm text-red-700 dark:text-red-300">This action cannot be undone. The vehicle record and associated data will be permanently deleted.</p>
			</div>
			<div class="flex gap-3">
				<Btn variant="danger" class="flex-1" onclick={() => deleteId && handleDelete(deleteId)}><Trash2 size={13} /> Confirm Delete</Btn>
				<Btn variant="secondary" onclick={() => (deleteId = null)}>Cancel</Btn>
			</div>
		</div>
	</Modal>
</div>
