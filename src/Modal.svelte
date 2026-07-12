<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	let {
		open,
		onClose,
		title,
		children
	}: { open: boolean; onClose: () => void; title: string; children: Snippet } = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			role="presentation"
			onclick={onClose}
			transition:fade={{ duration: 150 }}
		></div>
		<div
			class="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<div class="flex items-center justify-between px-6 py-4 border-b border-border">
				<h2 class="text-base font-semibold font-outfit text-card-foreground">{title}</h2>
				<button
					onclick={onClose}
					class="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
				>
					<X size={16} />
				</button>
			</div>
			<div class="p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}