<script lang="ts">
	import { Plus, Search, Download, Check, Fuel as FuelIcon } from 'lucide-svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Input from '$lib/components/Input.svelte';
	import Select from '$lib/components/Select.svelte';
	import { appState } from '$lib/state/app-state.svelte';
	import { FUEL_DATA, VEHICLES_DATA, DRIVERS_DATA, fmtKES } from '$lib/data';
	import { Droplets, TrendingUp, Gauge } from 'lucide-svelte';

	let entries = $state(FUEL_DATA.map((f) => ({ ...f })));
	let search = $state('');
	let modalOpen = $state(false);

	const emptyForm = { vehicle: VEHICLES_DATA[0].plate, driver: DRIVERS_DATA[0].name, liters: '0', costPerLiter: '185', station: '' };
	let form = $state({ ...emptyForm });

	const filtered = $derived(
		entries.filter((f) => {
			const q = search.toLowerCase();
			return !q || f.vehicle.toLowerCase().includes(q) || f.driver.toLowerCase().includes(q) || f.station.toLowerCase().includes(q);
		})
	);

	const canEdit = $derived(appState.role === 'admin' || appState.role === 'manager');
	const totalSpend = $derived(entries.reduce((s, f) => s + f.total, 0));
	const totalLiters = $derived(entries.reduce((s, f) => s + f.liters, 0));
	const avgCost = $derived(totalLiters > 0 ? Math.round(totalSpend / totalLiters) : 0);

	function openAdd() {
		form = { ...emptyForm };
		modalOpen = true;
	}

	function handleSave() {
		if (!form.station || Number(form.liters) <= 0) return;
		const liters = Number(form.liters);
		const costPerLiter = Number(form.costPerLiter);
		entries = [
			{
				id: `F${String(entries.length + 1).padStart(3, '0')}`,
				date: new Date().toISOString().slice(0, 10),
				vehicle: form.vehicle,
				driver: form.driver,
				liters,
				costPerLiter,
				total: Math.round(liters * costPerLiter),
				station: form.station
			},
			...entries
		];
		modalOpen = false;
	}
</script>

<div>
	<SectionHeader title="Fuel & Expenses" description="Track fuel consumption and refuel costs across the fleet">
		{#snippet action()}
			{#if canEdit}
				<Btn variant="primary" size="sm" onclick={openAdd}><Plus size={13} /> Log Refuel</Btn>
			{/if}
		{/snippet}
	</SectionHeader>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
		<StatCard label="Total Fuel Spend" value={fmtKES(totalSpend)} sub={`${entries.length} refuel entries`} icon={FuelIcon} color="bg-amber-600" />
		<StatCard label="Total Volume" value={`${totalLiters.toLocaleString()} L`} sub="Across all vehicles" icon={Droplets} color="bg-blue-600" />
		<StatCard label="Avg Cost / Liter" value={`KES ${avgCost}`} sub="Fleet-wide average" icon={Gauge} color="bg-violet-600" />
	</div>

	<div class="flex flex-wrap items-center gap-3 mb-5">
		<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
			<Search size={13} class="text-muted-foreground" />
			<input bind:value={search} placeholder="Search fuel entries…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
		</div>
		<Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
	</div>

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['Date', 'Vehicle', 'Driver', 'Liters', 'Rate', 'Total', 'Station'] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as f (f.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 text-xs font-dm-mono text-muted-foreground">{f.date}</td>
							<td class="px-4 py-3 text-xs font-dm-mono font-medium text-foreground">{f.vehicle}</td>
							<td class="px-4 py-3 text-xs text-foreground">{f.driver}</td>
							<td class="px-4 py-3 text-xs font-dm-mono text-foreground">{f.liters} L</td>
							<td class="px-4 py-3 text-xs font-dm-mono text-muted-foreground">KES {f.costPerLiter}</td>
							<td class="px-4 py-3 text-xs font-dm-mono font-medium text-foreground">{fmtKES(f.total)}</td>
							<td class="px-4 py-3 text-xs text-muted-foreground">{f.station}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<Modal open={modalOpen} onClose={() => (modalOpen = false)} title="Log Refuel">
		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<FormField label="Vehicle">
					<Select bind:value={form.vehicle}>
						{#each VEHICLES_DATA as v (v.id)}<option value={v.plate}>{v.plate}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Driver">
					<Select bind:value={form.driver}>
						{#each DRIVERS_DATA as d (d.id)}<option value={d.name}>{d.name}</option>{/each}
					</Select>
				</FormField>
				<FormField label="Liters *"><Input type="number" bind:value={form.liters} /></FormField>
				<FormField label="Cost per Liter (KES)"><Input type="number" bind:value={form.costPerLiter} /></FormField>
			</div>
			<FormField label="Station *"><Input bind:value={form.station} placeholder="Total Energies, Mombasa Rd" /></FormField>
			<div class="flex gap-3 pt-2">
				<Btn variant="primary" class="flex-1" onclick={handleSave}><Check size={13} /> Log Entry</Btn>
				<Btn variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Btn>
			</div>
		</div>
	</Modal>
</div>