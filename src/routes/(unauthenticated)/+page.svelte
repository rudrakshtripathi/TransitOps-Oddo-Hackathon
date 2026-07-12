<script lang="ts">
	import { resolve } from '$app/paths';

	import { buttonVariants } from '$lib/components/ui/button';

	let { data } = $props();
	let { session } = $derived(data);
</script>

<svelte:head>
	<title>TransitOps</title>
	<meta name="description" content="TransitOps Homepage" />
</svelte:head>

<div
	class="mx-auto grid h-[80svh] w-full max-w-2xl grid-cols-1 place-content-center gap-8 text-center"
>
	<h1 class="text-3xl font-bold">TransitOps</h1>

	{#if session !== null}
		<a href={resolve('/app')} class={buttonVariants({ variant: 'default', size: 'lg' })}>
			<span class="font-semibold"> Goto App </span>
		</a>
	{:else}
		<a
			href="/auth"
			class={buttonVariants({
				variant: 'default',
				size: 'lg'
			})}
		>
			<span class="font-semibold"> Login </span>
		</a>
	{/if}
</div>
