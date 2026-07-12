<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
	let collapsed = $state(false);
</script>

<svelte:head>
	<title>TransitOps — Fleet Management</title>
</svelte:head>

<div class="flex h-screen bg-background overflow-hidden">
	<Sidebar user={data.dbUser} {collapsed} ontoggle={() => (collapsed = !collapsed)} />
	<div class="flex-1 flex flex-col overflow-hidden min-w-0">
		<TopBar user={data.dbUser} ontoggleSidebar={() => (collapsed = !collapsed)} />
		<main class="flex-1 overflow-auto">
			<div class="p-5 lg:p-6 max-w-7xl mx-auto">
				{@render children()}
			</div>
		</main>
	</div>
</div>
