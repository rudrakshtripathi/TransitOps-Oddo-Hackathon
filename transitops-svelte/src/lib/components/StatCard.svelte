<script lang="ts">
	import { ArrowUpRight, ArrowDownRight, type Icon as IconType } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fly } from 'svelte/transition';

	let {
		label,
		value,
		sub,
		trend,
		icon: Icon,
		color
	}: {
		label: string;
		value: string;
		sub?: string;
		trend?: number;
		icon: typeof IconType;
		color: string;
	} = $props();

	const isPositive = $derived((trend ?? 0) >= 0);
</script>

<div
	class="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
	in:fly={{ y: 12, duration: 200 }}
>
	<div class="flex items-center justify-between">
		<span class="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span
		>
		<div class={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
			<Icon size={16} class="text-white" />
		</div>
	</div>
	<div>
		<div class="text-2xl font-bold font-outfit text-card-foreground">{value}</div>
		{#if sub}
			<div class="text-xs text-muted-foreground mt-0.5 font-dm-mono">{sub}</div>
		{/if}
	</div>
	{#if trend !== undefined}
		<div
			class={cn(
				'flex items-center gap-1 text-xs font-dm-mono',
				isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
			)}
		>
			{#if isPositive}
				<ArrowUpRight size={12} />
			{:else}
				<ArrowDownRight size={12} />
			{/if}
			{Math.abs(trend)}% vs last month
		</div>
	{/if}
</div>
