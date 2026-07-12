<script lang="ts">
	import { Truck, Users, Navigation, DollarSign, Download, AlertTriangle } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	// Static local data since we don't have a backend data file yet
	const stats = [
		{ label: 'Active Vehicles', value: '4 / 8', sub: '2 idle · 1 maintenance', icon: Truck, trend: '+12%', isPositive: true },
		{ label: 'Active Drivers', value: '5 / 7', sub: '1 on leave · 1 inactive', icon: Users, trend: '+8%', isPositive: true },
		{ label: 'Trips This Month', value: '94', sub: '2 in progress', icon: Navigation, trend: '-18%', isPositive: false },
		{ label: 'Revenue (Jan)', value: 'KES 1.45M', sub: 'Target: KES 5.8M', icon: DollarSign, trend: '-21%', isPositive: false }
	];

	const recentTrips = [
		{ id: 'T001', route: 'Nairobi - Mombasa', driver: 'John Doe', vehicle: 'KAA 123A', status: 'completed' },
		{ id: 'T002', route: 'Westlands - Kilimani', driver: 'Jane Smith', vehicle: 'KAB 456B', status: 'in progress' },
		{ id: 'T003', route: 'Mombasa - Nakuru', driver: 'David Kimani', vehicle: 'KAC 789C', status: 'pending' }
	];

	const maintenanceAlerts = [
		{ id: 'M001', vehicle: 'KAA 123A', type: 'Engine Oil Change', scheduled: '2026-07-15', priority: 'critical' },
		{ id: 'M002', vehicle: 'KAC 789C', type: 'Brake Inspection', scheduled: '2026-07-20', priority: 'medium' }
	];

	function getStatusBadge(status: string) {
		switch (status.toLowerCase()) {
			case 'completed':
			case 'success':
				return { variant: 'default' as const, class: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15' };
			case 'in progress':
			case 'active':
				return { variant: 'secondary' as const, class: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25 hover:bg-blue-500/15' };
			case 'pending':
				return { variant: 'outline' as const, class: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/15' };
			default:
				return { variant: 'outline' as const, class: '' };
		}
	}
</script>

<svelte:head>
	<title>Dashboard | TransitOps</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-foreground font-heading">Dashboard</h1>
			<p class="text-sm text-muted-foreground">Welcome to your fleet management console.</p>
		</div>
		<Button variant="outline" size="sm">
			<Download class="mr-2 size-4" />
			Export Reports
		</Button>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground">{stat.label}</Card.Title>
					<stat.icon class="size-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{stat.value}</div>
					<div class="flex items-center gap-2 mt-1">
						<span class={['text-xs font-semibold', stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400']}>
							{stat.trend}
						</span>
						<span class="text-xs text-muted-foreground">{stat.sub}</span>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Analytics Charts Mockups -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<!-- Revenue Area Chart Placeholder -->
		<Card.Root class="col-span-4">
			<Card.Header>
				<Card.Title>Revenue & Fuel Cost</Card.Title>
				<Card.Description>Aug 2025 — Jan 2026 (KES thousands)</Card.Description>
			</Card.Header>
			<Card.Content class="h-[240px] flex items-center justify-center border border-dashed rounded-lg m-6 bg-muted/20">
				<div class="text-center space-y-1">
					<p class="text-sm font-medium text-foreground">Revenue Analytics Chart</p>
					<p class="text-xs text-muted-foreground">Data visualization will load here once live telemetry is connected.</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Fleet Status Pie Chart Placeholder -->
		<Card.Root class="col-span-3">
			<Card.Header>
				<Card.Title>Fleet Status</Card.Title>
				<Card.Description>Real-time vehicle availability</Card.Description>
			</Card.Header>
			<Card.Content class="h-[240px] flex items-center justify-center border border-dashed rounded-lg m-6 bg-muted/20">
				<div class="text-center space-y-1">
					<p class="text-sm font-medium text-foreground">Status Distribution</p>
					<p class="text-xs text-muted-foreground">4 Active · 2 Idle · 1 Maintenance · 1 Retired</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Bottom Section: Recent Trips & Maintenance Alerts -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<!-- Recent Trips -->
		<Card.Root class="col-span-4">
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<div>
					<Card.Title>Recent Trips</Card.Title>
					<Card.Description>Latest trips logged in the system.</Card.Description>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each recentTrips as trip}
						{@const badgeInfo = getStatusBadge(trip.status)}
						<div class="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
							<div class="space-y-1">
								<p class="text-sm font-medium leading-none text-foreground">{trip.route}</p>
								<p class="text-xs text-muted-foreground">{trip.driver} · {trip.vehicle}</p>
							</div>
							<Badge variant={badgeInfo.variant} class={badgeInfo.class}>
								{trip.status}
							</Badge>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Maintenance Alerts -->
		<Card.Root class="col-span-3">
			<Card.Header>
				<Card.Title>Maintenance Alerts</Card.Title>
				<Card.Description>Attention required for specific vehicles.</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if maintenanceAlerts.length > 0}
					<div class="space-y-4">
						{#each maintenanceAlerts as alert}
							<div class="flex items-start gap-2.5 pb-3 border-b last:border-0 last:pb-0">
								<AlertTriangle class={['size-4 shrink-0 mt-0.5', alert.priority === 'critical' ? 'text-red-500' : 'text-amber-500']} />
								<div class="space-y-1 flex-1">
									<p class="text-sm font-medium leading-none text-foreground">{alert.vehicle} — {alert.type}</p>
									<p class="text-xs text-muted-foreground">Scheduled: {alert.scheduled}</p>
								</div>
								<Badge variant={alert.priority === 'critical' ? 'destructive' : 'secondary'} class="text-[10px] px-1.5 py-0.5">
									{alert.priority}
								</Badge>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground text-center py-6">No pending maintenance alerts.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
