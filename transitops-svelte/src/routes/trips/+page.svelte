<script lang="ts">
	import { Plus, Search, Download, Trash2, AlertTriangle, Check, Clock, MapPin } from 'lucide-svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { appState } from '$lib/state/app-state.svelte';
	import { TRIPS_DATA, DRIVERS_DATA, VEHICLES_DATA, fmtKES, type BadgeVariant } from '$lib/data';

	let trips = $state(TRIPS_DATA.map((t) => ({ ...t })));
	let search = $state('');
	let filterStatus = $state('all');
	let modalOpen = $state(false);
	let cancelId = $state<string | null>(null);

	const emptyForm = { route: '', driver: DRIVERS_DATA[0].name, vehicle: VEHICLES_DATA[0].plate, departure: '', passengers: '0' };
	let form = $state({ ...emptyForm });

	const filtered = $derived(
		trips.filter((t) => {
			const q = search.toLowerCase();
			const matchSearch = !q || t.route.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q);
			const matchStatus = filterStatus === 'all' || t.status === filterStatus;
			return matchSearch && matchStatus;
		})
	);

	const canEdit = $derived(appState.role === 'admin' || appState.role === 'manager');

	function openAdd() {
		form = { ...emptyForm };
		modalOpen = true;
	}

	function handleSave() {
		if (!form.route || !form.departure) return;
		trips = [
			{
				id: `T${String(trips.length + 1).padStart(3, '0')}`,
				route: form.route,
				driver: form.driver,
				vehicle: form.vehicle,
				departure: form.departure,
				arrival: '—',
				distance: 0,
				status: 'scheduled',
				passengers: Number(form.passengers),
				revenue: 0
			},
			...trips
		];
		modalOpen = false;
	}

	function handleCancel(id: string) {
		trips = trips.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t));
		cancelId = null;
	}

	const totalRevenue = $derived(filtered.reduce((s, t) => s + t.revenue, 0));
</script>

<div>
	<SectionHeader title="Trip Operations" description={`${trips.length} trips · ${fmtKES(totalRevenue)} total revenue (filtered)`}>
		{#snippet action()}
			{#if canEdit}
				<Btn variant="primary" size="sm" onclick={openAdd}><Plus size={13} /> Schedule Trip</Btn>
			{/if}
		{/snippet}
	</SectionHeader>

	<div class="flex flex-wrap items-center gap-3 mb-5">
		<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
			<Search size={13} class="text-muted-foreground" />
			<input bind:value={search} placeholder="Search trips…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
		</div>
		<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
			<option value="all">All Status</option>
			{#each ['scheduled', 'in_progress', 'completed', 'cancelled'] as s (s)}<option value={s}>{s.replace('_', ' ')}</option>{/each}
		</select>
		<Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
	</div>

	{#if filtered.length === 0}
		<div class="bg-card border border-border rounded-xl grid grid-cols-2">
			<EmptyState icon={MapPin} title="No trips found" description="Try adjusting your search or filters, or schedule a new trip." />
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			{#each filtered as t (t.id)}
				<div class="bg-card border border-border rounded-xl p-4">
					<div class="flex items-start justify-between mb-2">
						<div>
							<div class="text-xs font-dm-mono text-muted-foreground">{t.id}</div>
							<div class="text-sm font-medium text-foreground mt-0.5">{t.route}</div>
						</div>
						<Badge status={t.status as BadgeVariant} />
					</div>
					<div class="flex items-center gap-2 text-xs text-muted-foreground mb-3">
						<Clock size={11} />
						<span class="font-dm-mono">{t.departure} → {t.arrival}</span>
					</div>
					<div class="grid grid-cols-2 gap-2 text-xs">
						<div>
							<span class="text-muted-foreground">Driver</span>
							<div class="text-foreground font-medium">{t.driver}</div>
						</div>
						<div>
							<span class="text-muted-foreground">Vehicle</span>
							<div class="text-foreground font-medium font-dm-mono">{t.vehicle}</div>
						</div>
						<div>
							<span class="text-muted-foreground">Distance</span>
							<div class="text-foreground font-dm-mono">{t.distance} km</div>
						</div>
						<div>
							<span class="text-muted-foreground">Revenue</span>
							<div class="text-foreground font-dm-mono">{fmtKES(t.revenue)}</div>
						</div>
					</div>
					{#if canEdit && (t.status === 'scheduled' || t.status === 'in_progress')}
						<div class="mt-3 pt-3 border-t border-border">
							<button onclick={() => (cancelId = t.id)} class="text-xs text-red-500 hover:underline">Cancel trip</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<Modal open={modalOpen} onClose={() => (modalOpen = false)} title="Schedule Trip">
		<div class="space-y-4">
			<FormField label="Route *"><Input bind:value={form.route} placeholder="Nairobi → Mombasa" /></FormField>
			<div class="grid grid-cols-2 gap-4">
				<FormField label="Driver">
					<Select bind:value={form.driver}>
						{#each DRIVERS_DATA as d (d.id)}<option value={d.name}>{d.name}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Vehicle">
					<Select bind:value={form.vehicle}>
						{#each VEHICLES_DATA as v (v.id)}<option value={v.plate}>{v.plate}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Departure *"><Input bind:value={form.departure} placeholder="2026-01-15 06:00" /></FormField>
				<FormField label="Expected Passengers"><Input type="number" bind:value={form.passengers} /></FormField>
			</div>
			<div class="flex gap-3 pt-2">
				<Btn variant="primary" class="flex-1" onclick={handleSave}><Check size={13} /> Schedule Trip</Btn>
				<Btn variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Btn>
			</div>
		</div>
	</Modal>

	<Modal open={!!cancelId} onClose={() => (cancelId = null)} title="Cancel Trip">
		<div class="space-y-4">
			<div class="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
				<AlertTriangle size={18} class="text-red-500 flex-shrink-0 mt-0.5" />
				<p class="text-sm text-red-700 dark:text-red-300">This will mark the trip as cancelled. Passengers and dispatch will need to be notified separately.</p>
			</div>
			<div class="flex gap-3">
				<Btn variant="danger" class="flex-1" onclick={() => cancelId && handleCancel(cancelId)}><Trash2 size={13} /> Confirm Cancel</Btn>
				<Btn variant="secondary" onclick={() => (cancelId = null)}>Back</Btn>
			</div>
		</div>
	</Modal>
</div>
