<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		action
	}: { title: string; description?: string; action?: Snippet } = $props();
</script>

<div class="flex items-start justify-between mb-6 gap-4">
	<div>
		<h1 class="text-xl font-bold font-outfit text-foreground">{title}</h1>
		{#if description}
			<p class="text-sm text-muted-foreground mt-0.5">{description}</p>
		{/if}
	</div>
	{#if action}
		<div class="flex items-center gap-2 flex-shrink-0">
			{@render action()}
		</div>
	{/if}
</div>
