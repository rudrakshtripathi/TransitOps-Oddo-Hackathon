<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		value = $bindable(''),
		children
	}: {
		value?: string;
		children: Snippet;
	} = $props();
</script>

<select
	bind:value
	class="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors"
>
	{@render children()}
</select>