<script lang="ts">
	import { Plus, Search, Download, Check, Wrench, AlertTriangle } from 'lucide-svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import { appState } from '$lib/state/app-state.svelte';
	import { MAINTENANCE_DATA, VEHICLES_DATA, fmtKES, type BadgeVariant } from '$lib/data';

	let records = $state(MAINTENANCE_DATA.map((m) => ({ ...m })));
	let search = $state('');
	let filterStatus = $state('all');
	let modalOpen = $state(false);
	let completeId = $state<string | null>(null);

	const emptyForm = { vehicle: VEHICLES_DATA[0].plate, type: '', scheduled: '', cost: '0', technician: '', priority: 'normal' };
	let form = $state({ ...emptyForm });

	const filtered = $derived(
		records.filter((m) => {
			const q = search.toLowerCase();
			const matchSearch = !q || m.vehicle.toLowerCase().includes(q) || m.type.toLowerCase().includes(q);
			const matchStatus = filterStatus === 'all' || m.status === filterStatus;
			return matchSearch && matchStatus;
		})
	);

	const canEdit = $derived(appState.role === 'admin' || appState.role === 'manager');
	const totalCost = $derived(filtered.reduce((s, m) => s + m.cost, 0));

	function openAdd() {
		form = { ...emptyForm };
		modalOpen = true;
	}

	function handleSave() {
		if (!form.type || !form.scheduled) return;
		records = [
			{
				id: `M${String(records.length + 1).padStart(3, '0')}`,
				vehicle: form.vehicle,
				type: form.type,
				scheduled: form.scheduled,
				status: 'upcoming',
				cost: Number(form.cost),
				technician: form.technician,
				priority: form.priority
			},
			...records
		];
		modalOpen = false;
	}

	function handleComplete(id: string) {
		records = records.map((m) => (m.id === id ? { ...m, status: 'completed' } : m));
		completeId = null;
	}
</script>

<div>
	<SectionHeader title="Maintenance" description={`${filtered.length} records · ${fmtKES(totalCost)} total cost (filtered)`}>
		{#snippet action()}
			{#if canEdit}
				<Btn variant="primary" size="sm" onclick={openAdd}><Plus size={13} /> Schedule Service</Btn>
			{/if}
		{/snippet}
	</SectionHeader>

	<div class="flex flex-wrap items-center gap-3 mb-5">
		<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
			<Search size={13} class="text-muted-foreground" />
			<input bind:value={search} placeholder="Search maintenance…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
		</div>
		<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
			<option value="all">All Status</option>
			{#each ['upcoming', 'in_progress', 'completed', 'overdue'] as s (s)}<option value={s}>{s.replace('_', ' ')}</option>{/each}
		</select>
		<Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
	</div>

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['ID', 'Vehicle', 'Service', 'Scheduled', 'Priority', 'Status', 'Cost', 'Technician', ''] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as m (m.id)}
						<tr class={m.status === 'overdue' ? 'bg-red-50/50 dark:bg-red-900/5' : ''}>
							<td class="px-4 py-3 font-dm-mono text-xs text-muted-foreground">{m.id}</td>
							<td class="px-4 py-3 font-dm-mono text-xs font-medium text-foreground">{m.vehicle}</td>
							<td class="px-4 py-3 text-xs text-foreground">
								<div class="flex items-center gap-1.5">
									<Wrench size={11} class="text-muted-foreground" />
									{m.type}
								</div>
							</td>
							<td class="px-4 py-3 text-xs font-dm-mono text-muted-foreground">{m.scheduled}</td>
							<td class="px-4 py-3"><Badge status={m.priority as BadgeVariant} /></td>
							<td class="px-4 py-3"><Badge status={m.status as BadgeVariant} /></td>
							<td class="px-4 py-3 text-xs font-dm-mono text-foreground">{fmtKES(m.cost)}</td>
							<td class="px-4 py-3 text-xs text-muted-foreground">{m.technician}</td>
							<td class="px-4 py-3">
								{#if canEdit && m.status !== 'completed'}
									<button onclick={() => (completeId = m.id)} class="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-colors" title="Mark complete">
										<Check size={13} />
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<Modal open={modalOpen} onClose={() => (modalOpen = false)} title="Schedule Service">
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<FormField label="Vehicle">
					<Select bind:value={form.vehicle}>
						{#each VEHICLES_DATA as v (v.id)}<option value={v.plate}>{v.plate}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Service Type *"><Input bind:value={form.type} placeholder="Oil Change" /></FormField>
				<FormField label="Scheduled Date *"><Input bind:value={form.scheduled} placeholder="2026-02-01" /></FormField>
				<FormField label="Estimated Cost (KES)"><Input type="number" bind:value={form.cost} /></FormField>
				<FormField label="Technician / Garage"><Input bind:value={form.technician} placeholder="Auto Care Garage" /></FormField>
				<FormField label="Priority">
					<Select bind:value={form.priority}>
						{#each ['low', 'normal', 'high', 'critical'] as p (p)}<option value={p}>{p}</option>{/each}
					</Select>
				</FormField>
			</div>
			<div class="flex gap-3 pt-2">
				<Btn variant="primary" class="flex-1" onclick={handleSave}><Check size={13} /> Schedule</Btn>
				<Btn variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Btn>
			</div>
		</div>
	</Modal>

	<Modal open={!!completeId} onClose={() => (completeId = null)} title="Mark Service Complete">
		<div class="space-y-4">
			<div class="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
				<AlertTriangle size={18} class="text-emerald-600 flex-shrink-0 mt-0.5" />
				<p class="text-sm text-emerald-700 dark:text-emerald-300">Confirm this maintenance record is finished. The vehicle will be marked available again.</p>
			</div>
			<div class="flex gap-3">
				<Btn variant="primary" class="flex-1" onclick={() => completeId && handleComplete(completeId)}><Check size={13} /> Confirm Complete</Btn>
				<Btn variant="secondary" onclick={() => (completeId = null)}>Cancel</Btn>
			</div>
		</div>
	</Modal>
</div>
