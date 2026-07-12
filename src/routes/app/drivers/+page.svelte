<script lang="ts">
	import { enhance } from '$app/forms';
	import { Users, Plus, Search, Edit2, Trash2, Check, AlertTriangle } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { DriverStatus } from '$lib/constants';
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
	let editDriver = $state<typeof data.drivers[0] | null>(null);
	let submitting = $state(false);

	const filtered = $derived(
		data.drivers.filter(d => {
			const q = search.toLowerCase();
			const matchQ = !q || d.name.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q);
			const matchS = filterStatus === 'all' || d.status === filterStatus;
			return matchQ && matchS;
		})
	);

	const statusColors: Record<string, string> = {
		[DriverStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
		[DriverStatus.ON_TRIP]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
		[DriverStatus.OFF_DUTY]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
		[DriverStatus.SUSPENDED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
	};

	function openAdd() {
		editDriver = null;
		modalOpen = true;
	}

	function openEdit(d: typeof data.drivers[0]) {
		editDriver = d;
		modalOpen = true;
	}

	$effect(() => {
		if (form?.success) {
			modalOpen = false;
			deleteId = null;
		}
	});

	function isExpired(dateStr: string) {
		return new Date(dateStr) < new Date();
	}
</script>

<svelte:head><title>Drivers — TransitOps</title></svelte:head>

<PageHeader title="Drivers" description="{data.drivers.length} registered drivers">
	{#snippet children()}
		<Button size="sm" onclick={openAdd}><Plus size={14} class="mr-1" />Add Driver</Button>
	{/snippet}
</PageHeader>

<div class="flex flex-wrap items-center gap-3 mb-5">
	<div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
		<Search size={13} class="text-muted-foreground shrink-0" />
		<input bind:value={search} placeholder="Search drivers…" class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
	</div>
	<select bind:value={filterStatus} class="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
		<option value="all">All Status</option>
		{#each Object.values(DriverStatus) as s (s)}
			<option value={s}>{s}</option>
		{/each}
	</select>
</div>

<div class="bg-card border border-border rounded-xl overflow-hidden">
	{#if filtered.length === 0}
		<EmptyState message="No drivers match your filters" icon={Users} />
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border bg-muted/40">
						{#each ['Name', 'License', 'Contact', 'Status', 'Safety Score', ''] as h (h)}
							<th class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each filtered as d (d.id)}
						<tr class="hover:bg-muted/30 transition-colors">
							<td class="px-4 py-3 font-medium text-xs text-foreground">{d.name}</td>
							<td class="px-4 py-3">
								<p class="font-mono text-xs text-foreground">{d.licenseNumber}</p>
								<p class="text-[10px] {isExpired(d.licenseExpiryDate) ? 'text-destructive font-semibold' : 'text-muted-foreground'}">
									Exp: {new Date(d.licenseExpiryDate).toLocaleDateString()}
								</p>
							</td>
							<td class="px-4 py-3 text-xs text-muted-foreground">{d.contactNumber}</td>
							<td class="px-4 py-3">
								<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium {statusColors[d.status] ?? 'bg-muted text-muted-foreground'}">{d.status}</span>
							</td>
							<td class="px-4 py-3 text-xs text-muted-foreground font-mono">{d.safetyScore}/100</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-1">
									<button onclick={() => openEdit(d)} class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit">
										<Edit2 size={12} />
									</button>
									<button onclick={() => (deleteId = d.id)} class="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors" aria-label="Delete">
										<Trash2 size={12} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">Showing {filtered.length} of {data.drivers.length}</div>
	{/if}
</div>

<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{editDriver ? 'Edit Driver' : 'Add Driver'}</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action={editDriver ? '?/update' : '?/create'}
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => { await update(); submitting = false; };
			}}
		>
			{#if editDriver}<input type="hidden" name="id" value={editDriver.id} />{/if}
			<div class="grid grid-cols-2 gap-4 py-4">
				<div class="flex flex-col gap-1.5 col-span-2">
					<Label for="name">Name *</Label>
					<Input id="name" name="name" required value={editDriver?.name ?? ''} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="licenseNumber">License Number *</Label>
					<Input id="licenseNumber" name="licenseNumber" required value={editDriver?.licenseNumber ?? ''} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="licenseCategory">Category *</Label>
					<Input id="licenseCategory" name="licenseCategory" required value={editDriver?.licenseCategory ?? ''} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="licenseExpiryDate">Expiry Date *</Label>
					<Input id="licenseExpiryDate" type="date" name="licenseExpiryDate" required value={editDriver?.licenseExpiryDate?.split('T')[0] ?? ''} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="contactNumber">Contact *</Label>
					<Input id="contactNumber" name="contactNumber" required value={editDriver?.contactNumber ?? ''} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="safetyScore">Safety Score (0-100)</Label>
					<Input id="safetyScore" name="safetyScore" type="number" min="0" max="100" value={editDriver?.safetyScore ?? 100} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="status">Status</Label>
					<select id="status" name="status" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
						{#each Object.values(DriverStatus) as s (s)}
							<option value={s} selected={editDriver?.status === s}>{s}</option>
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
					<Check size={13} class="mr-1" />{editDriver ? 'Save Changes' : 'Add Driver'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={!!deleteId} onOpenChange={(open) => !open && (deleteId = null)}>
	<Dialog.Content class="sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Delete Driver</Dialog.Title>
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
