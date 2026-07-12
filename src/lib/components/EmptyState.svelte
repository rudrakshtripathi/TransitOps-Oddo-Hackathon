<script lang="ts">
	import type { Component } from 'svelte';
	let { message = 'No data found.', icon: Icon }: { message?: string; icon?: Component<any> } = $props();
</script>

<div class="py-16 text-center">
	{#if Icon}
		<div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
			<Icon size={22} class="text-muted-foreground" />
		</div>
	{/if}
	<p class="text-sm text-muted-foreground">{message}</p>
</div>
