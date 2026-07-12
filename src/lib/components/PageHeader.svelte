<script lang="ts">
	let { title, description, children }: {
		title: string;
		description?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div class="flex items-center justify-between mb-6">
	<div>
		<h2 class="text-base font-semibold text-foreground">{title}</h2>
		{#if description}
			<p class="text-sm text-muted-foreground mt-0.5">{description}</p>
		{/if}
	</div>
	{#if children}
		<div>{@render children()}</div>
	{/if}
</div>
