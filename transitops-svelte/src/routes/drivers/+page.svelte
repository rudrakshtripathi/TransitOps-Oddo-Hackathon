<script lang="ts">
	import { Plus, Search, Download, Edit2, Trash2, AlertTriangle, Check, User, Star } from 'lucide-svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import { appState } from '$lib/state/app-state.svelte';
	import { DRIVERS_DATA, type BadgeVariant } from '$lib/data';

	let drivers = $state(DRIVERS_DATA.map((d) => ({ ...d })));
	let search = $state('');
	let filterStatus = $state('all');
	let modalOpen = $state(false);
	let editId = $state<string | null>(null);
	let deleteId = $state<string | null>(null);

	const emptyForm = { name: '', email: '', phone: '', license: '', licenseClass: 'C', status: 'active' };
	let form = $state({ ...emptyForm });

	const filtered = $derived(
		drivers.filter((d) => {
			const q = search.toLowerCase();
			const matchSearch =
				!q || d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.license.toLowerCase().includes(q);
			const matchStatus = filterStatus === 'all' || d.status === filterStatus;
			return matchSearch && matchStatus;
		})
	);

	const canEdit = $derived(appState.role === 'admin' || appState.role === 'manager');

	function openAdd() {
		editId = null;
		form = { ...emptyForm };
		modalOpen = true;
	}

	function openEdit(d: (typeof DRIVERS_DATA)[0]) {
		editId = d.id;
		form = { name: d.name, email: d.email, phone: d.phone, license: d.license, licenseClass: d.licenseClass, status: d.status };
		modalOpen = true;
	}

	function handleSave() {
		if (!form.name || !form.email) return;
		if (editId) {
			drivers = drivers.map((d) => (d.id === editId ? { ...d, ...form } : d));
		} else {
			drivers = [
				{
					...form,
					id: `D${String(drivers.length + 1).padStart(3, '0')}`,
					joined: new Date().toISOString().slice(0, 10),
					trips: 0,
					rating: 5.0,
					vehicle: '—',
					experience: 0
				},
				...drivers
			];
		}
		modalOpen = false;
	}

	function handleDelete(id: string) {
		drivers = drivers.filter((d) => d.id !== id);
		deleteId = null;
	}
</script>

<div>
	<SectionHeader title="Driver Registry" description={`${drivers.length} registered drivers`}>
		{#snippet action()}
			{#if canEdit}
				<Btn variant="primary" size="sm" onclick={openAdd}><Plus size={13} /> Add Driver</Btn>
			{/if}
		{/snippet}
	</SectionHeader>

	<div class="flex flex-wrap items-center gap-3 mb-5">
		<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
			<Search size={13} class="text-muted-foreground" />
			<input bind:value={search} placeholder="Search drivers…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
		</div>
		<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
			<option value="all">All Status</option>
			{#each ['active', 'on_leave', 'inactive'] as s (s)}<option value={s}>{s.replace('_', ' ')}</option>{/each}
		</select>
		<Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
	</div>

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['Driver', 'License', 'Class', 'Contact', 'Status', 'Vehicle', 'Trips', 'Rating', ''] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as d (d.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3">
								<div class="flex items-center gap-2.5">
									<div class="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
										<User size={12} class="text-primary" />
									</div>
									<div>
										<div class="text-xs font-medium text-foreground">{d.name}</div>
										<div class="text-[10px] text-muted-foreground">{d.experience}y exp</div>
									</div>
								</div>
							</td>
							<td class="px-4 py-3 text-xs font-dm-mono text-muted-foreground">{d.license}</td>
							<td class="px-4 py-3 text-xs font-dm-mono font-medium text-foreground">{d.licenseClass}</td>
							<td class="px-4 py-3">
								<div class="text-xs text-foreground">{d.phone}</div>
								<div class="text-[10px] text-muted-foreground">{d.email}</div>
							</td>
							<td class="px-4 py-3"><Badge status={d.status as BadgeVariant} /></td>
							<td class="px-4 py-3 text-xs font-dm-mono text-foreground">{d.vehicle}</td>
							<td class="px-4 py-3 text-xs font-dm-mono text-foreground">{d.trips.toLocaleString()}</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-1 text-xs">
									<Star size={10} class="text-amber-400 fill-amber-400" />
									<span class="font-dm-mono text-foreground">{d.rating}</span>
								</div>
							</td>
							<td class="px-4 py-3">
								{#if canEdit}
									<div class="flex items-center gap-1">
										<button onclick={() => openEdit(d)} class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={12} /></button>
										<button onclick={() => (deleteId = d.id)} class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-dm-mono">
			Showing {filtered.length} of {drivers.length} drivers
		</div>
	</div>

	<Modal open={modalOpen} onClose={() => (modalOpen = false)} title={editId ? 'Edit Driver' : 'Add Driver'}>
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<FormField label="Full Name *"><Input bind:value={form.name} placeholder="James Mwangi" /></FormField>
				<FormField label="Status">
					<Select bind:value={form.status}>
						{#each ['active', 'on_leave', 'inactive'] as s (s)}<option value={s}>{s.replace('_', ' ')}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Email *"><Input type="email" bind:value={form.email} placeholder="driver@transitops.co" /></FormField>
				<FormField label="Phone"><Input bind:value={form.phone} placeholder="+254 7XX XXX XXX" /></FormField>
				<FormField label="License No."><Input bind:value={form.license} placeholder="DL-2024-0001" /></FormField>
				<FormField label="License Class">
					<Select bind:value={form.licenseClass}>
						{#each ['A', 'B', 'C', 'C1', 'C1E', 'D', 'D1'] as c (c)}<option>{c}</option>{/each}
					</Select>
				</FormField>
			</div>
			<div class="flex gap-3 pt-2">
				<Btn variant="primary" class="flex-1" onclick={handleSave}><Check size={13} /> {editId ? 'Save Changes' : 'Add Driver'}</Btn>
				<Btn variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Btn>
			</div>
		</div>
	</Modal>

	<Modal open={!!deleteId} onClose={() => (deleteId = null)} title="Remove Driver">
		<div class="space-y-4">
			<div class="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
				<AlertTriangle size={18} class="text-red-500 flex-shrink-0 mt-0.5" />
				<p class="text-sm text-red-700 dark:text-red-300">This will permanently remove the driver record. Assign their vehicle to another driver first.</p>
			</div>
			<div class="flex gap-3">
				<Btn variant="danger" class="flex-1" onclick={() => deleteId && handleDelete(deleteId)}><Trash2 size={13} /> Confirm Remove</Btn>
				<Btn variant="secondary" onclick={() => (deleteId = null)}>Cancel</Btn>
			</div>
		</div>
	</Modal>
</div>
