<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		children,
		onclick,
		type = 'button',
		disabled = false
	}: {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md';
		class?: string;
		children: Snippet;
		onclick?: (e: MouseEvent) => void;
		type?: 'button' | 'submit';
		disabled?: boolean;
	} = $props();

	const base =
		'inline-flex items-center gap-2 rounded-lg font-medium transition-all focus:outline-none';
	const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
	const variants = {
		primary: 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-muted border border-border',
		ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
		danger: 'bg-destructive text-destructive-foreground hover:opacity-90'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class={cn(base, sizes[size], variants[variant], disabled && 'opacity-70', className)}
>
	{@render children()}
</button>