<script lang="ts">
	import { enhance } from '$app/forms';
	import { Receipt, Plus, Search, Trash2, Check, AlertTriangle } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { ExpenseType } from '$lib/constants';
	import { toNum } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let filterType = $state('all');
	let modalOpen = $state(false);
	let deleteId = $state<string | null>(null);
	let submitting = $state(false);
	
	let selectedType = $state(ExpenseType.FUEL);

	const filtered = $derived(
		data.expenses.filter(e => {
			return filterType === 'all' || e.type === filterType;
		})
	);

	const typeColors: Record<string, string> = {
		[ExpenseType.FUEL]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
		[ExpenseType.MAINTENANCE]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
		[ExpenseType.TOLL]: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
	};

	function getVehicleReg(id: string) {
		const v = data.vehicles.find(v => v.id === id);
		return v ? v.registrationNumber : 'Unknown';
	}

	$effect(() => {
		if (form?.success) {
			modalOpen = false;
			deleteId = null;
		}
	});
</script>

<svelte:head><title>Expenses — TransitOps</title></svelte:head>

<PageHeader title="Expenses" description="{data.expenses.length} total expense records">
	{#snippet children()}
		<Button size="sm" onclick={() => modalOpen = true}><Plus size={14} class="mr-1" />Add Expense</Button>
	{/snippet}
</PageHeader>

<div class="flex flex-wrap items-center gap-3 mb-5">
	<select bind:value={filterType} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none min-w-40">
		<option value="all">All Expense Types</option>
		{#each Object.values(ExpenseType) as t (t)}
			<option value={t}>{t}</option>
		{/each}
	</select>
</div>

<div class="bg-card border border-border rounded-xl overflow-hidden">
	{#if filtered.length === 0}
		<EmptyState message="No expenses match your filters" icon={Receipt} />
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['Vehicle', 'Type', 'Cost', 'Liters', 'Date', 'Actions'] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as e (e.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 font-mono text-xs font-medium text-foreground">{getVehicleReg(e.vehicleId)}</td>
							<td class="px-4 py-3">
								<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium {typeColors[e.type] ?? 'bg-muted text-muted-foreground'}">{e.type}</span>
							</td>
							<td class="px-4 py-3 text-xs text-foreground font-mono">${toNum(e.cost).toLocaleString()}</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{e.liters ? `${toNum(e.liters).toLocaleString()} L` : '-'}</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{new Date(e.date).toLocaleDateString()}</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-1">
									<button onclick={() => (deleteId = e.id)} class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors" aria-label="Delete">
										<Trash2 size={12} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">Showing {filtered.length} of {data.expenses.length}</div>
	{/if}
</div>

<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Expense</Dialog.Title>
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
				<div class="flex flex-col gap-1.5 col-span-2">
					<Label for="vehicleId">Vehicle *</Label>
					<select id="vehicleId" name="vehicleId" required class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each data.vehicles as v (v.id)}
							<option value={v.id}>{v.registrationNumber} ({v.name})</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5 col-span-2">
					<Label for="type">Expense Type *</Label>
					<select id="type" name="type" bind:value={selectedType} required class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each Object.values(ExpenseType) as t (t)}
							<option value={t}>{t}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cost">Cost ($) *</Label>
					<Input id="cost" name="cost" type="number" step="0.01" min="0" required />
				</div>
				{#if selectedType === ExpenseType.FUEL}
					<div class="flex flex-col gap-1.5">
						<Label for="liters">Liters *</Label>
						<Input id="liters" name="liters" type="number" step="0.01" min="0" required />
					</div>
				{/if}
			</div>
			{#if form?.error}
				<p class="text-xs text-destructive mb-3">{form.error}</p>
			{/if}
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (modalOpen = false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					<Check size={13} class="mr-1" />Add Expense
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={!!deleteId} onOpenChange={(open) => !open && (deleteId = null)}>
	<Dialog.Content class="sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Delete Expense</Dialog.Title>
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
