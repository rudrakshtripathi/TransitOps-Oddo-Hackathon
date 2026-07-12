<script lang="ts">
	import { enhance } from '$app/forms';
	import { Wrench, Plus, Check, Search } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { MaintenanceLogStatus } from '$lib/constants';
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
	let submitting = $state(false);
	
	const filtered = $derived(
		data.logs.filter(log => {
			const q = search.toLowerCase();
			const vehicle = data.vehicles.find(v => v.id === log.vehicleId);
			const matchQ = !q || log.description.toLowerCase().includes(q) || (vehicle && vehicle.registrationNumber.toLowerCase().includes(q));
			const matchS = filterStatus === 'all' || log.status === filterStatus;
			return matchQ && matchS;
		})
	);

	function getVehicleReg(id: string) {
		const v = data.vehicles.find(v => v.id === id);
		return v ? v.registrationNumber : 'Unknown';
	}

	$effect(() => {
		if (form?.success) {
			modalOpen = false;
		}
	});
</script>

<svelte:head><title>Maintenance — TransitOps</title></svelte:head>

<PageHeader title="Maintenance Logs" description="{data.logs.length} total maintenance records">
	{#snippet children()}
		<Button size="sm" onclick={() => modalOpen = true}><Plus size={14} class="mr-1" />Add Log</Button>
	{/snippet}
</PageHeader>

<div class="flex flex-wrap items-center gap-3 mb-5">
	<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
		<Search size={13} class="text-muted-foreground shrink-0" />
		<input bind:value={search} placeholder="Search by description or reg…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
	</div>
	<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
		<option value="all">All Status</option>
		{#each Object.values(MaintenanceLogStatus) as s (s)}
			<option value={s}>{s}</option>
		{/each}
	</select>
</div>

<div class="bg-card border border-border rounded-xl overflow-hidden">
	{#if filtered.length === 0}
		<EmptyState message="No maintenance logs match your filters" icon={Wrench} />
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['Vehicle', 'Description', 'Cost', 'Status', 'Date Logged', 'Actions'] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as log (log.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 font-mono text-xs font-medium text-foreground">{getVehicleReg(log.vehicleId)}</td>
							<td class="px-4 py-3 text-xs text-foreground max-w-[200px] truncate" title={log.description}>{log.description}</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">${toNum(log.cost).toLocaleString()}</td>
							<td class="px-4 py-3">
								<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium {log.status === MaintenanceLogStatus.OPEN ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}">{log.status}</span>
							</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{new Date(log.dateLogged).toLocaleDateString()}</td>
							<td class="px-4 py-3">
								{#if log.status === MaintenanceLogStatus.OPEN}
									<form method="POST" action="?/close" use:enhance>
										<input type="hidden" name="id" value={log.id} />
										<button type="submit" class="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-500 transition-colors" title="Mark as Closed">
											<Check size={12} />
										</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">Showing {filtered.length} of {data.logs.length}</div>
	{/if}
</div>

<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Maintenance Log</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => { await update(); submitting = false; };
			}}
		>
			<div class="grid gap-4 py-4">
				<div class="flex flex-col gap-1.5">
					<Label for="vehicleId">Vehicle *</Label>
					<select id="vehicleId" name="vehicleId" required class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each data.vehicles as v (v.id)}
							<option value={v.id}>{v.registrationNumber} ({v.name})</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="description">Description *</Label>
					<textarea id="description" name="description" required rows="3" class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cost">Cost ($) *</Label>
					<Input id="cost" name="cost" type="number" step="0.01" min="0" required />
				</div>
			</div>
			{#if form?.error}
				<p class="text-xs text-destructive mb-3">{form.error}</p>
			{/if}
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (modalOpen = false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					<Check size={13} class="mr-1" />Add Log
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
