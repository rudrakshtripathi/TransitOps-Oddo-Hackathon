<script lang="ts">
	import '../app.css';
	import { appState } from '$lib/state/app-state.svelte';
	import AuthScreen from '$lib/components/AuthScreen.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { View } from '$lib/data';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	const viewFromPath: Record<string, View> = {
		'/': 'dashboard',
		'/vehicles': 'vehicles',
		'/drivers': 'drivers',
		'/trips': 'trips',
		'/maintenance': 'maintenance',
		'/fuel': 'fuel',
		'/analytics': 'analytics',
		'/settings': 'settings'
	};

	const currentView = $derived(viewFromPath[page.url.pathname] ?? 'dashboard');

	function nav(id: string) {
		goto(id === 'dashboard' ? '/' : `/${id}`);
	}
</script>

<svelte:head>
	<title>TransitOps — Fleet Management Platform</title>
</svelte:head>

{#if !appState.authenticated}
	<AuthScreen onlogin={(r) => appState.login(r)} />
{:else}
	<div class={appState.isDark ? 'dark' : ''}>
		<div class="flex h-screen bg-background overflow-hidden">
			<Sidebar
				active={currentView}
				collapsed={appState.sidebarCollapsed}
				role={appState.role}
				onnav={nav}
			/>

			<div class="flex-1 flex flex-col overflow-hidden min-w-0">
				<TopBar
					view={currentView}
					role={appState.role}
					isDark={appState.isDark}
					ontogglesidebar={() => appState.toggleSidebar()}
					ontoggletheme={() => appState.toggleTheme()}
					onlogout={() => appState.logout()}
				/>

				<main class="flex-1 overflow-auto">
					<div class="p-5 lg:p-6 max-w-7xl mx-auto">
						{#key page.url.pathname}
							<div in:fade={{ duration: 150 }}>
								{@render children()}
							</div>
						{/key}
					</div>
				</main>
			</div>
		</div>
	</div>
{/if}
