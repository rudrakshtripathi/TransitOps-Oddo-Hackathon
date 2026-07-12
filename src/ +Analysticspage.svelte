<script lang="ts">
	import { Download } from 'lucide-svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import MonthlyTripsBar from '$lib/components/charts/MonthlyTripsBar.svelte';
	import RevenueVsFuelLine from '$lib/components/charts/RevenueVsFuelLine.svelte';
	import DriverPerfBar from '$lib/components/charts/DriverPerfBar.svelte';
	import { MONTHLY_CHART, DRIVER_PERF, TRIPS_DATA, fmtKES } from '$lib/data';
	import { TrendingUp, Navigation, Fuel, Users } from 'lucide-svelte';

	const totalRevenue = MONTHLY_CHART.reduce((s, m) => s + m.revenue, 0) * 1000;
	const totalTrips = MONTHLY_CHART.reduce((s, m) => s + m.trips, 0);
	const totalFuel = MONTHLY_CHART.reduce((s, m) => s + m.fuel, 0) * 1000;
	const avgOnTime = Math.round(DRIVER_PERF.reduce((s, d) => s + d.onTime, 0) / DRIVER_PERF.length);
	const completedTrips = TRIPS_DATA.filter((t) => t.status === 'completed').length;
</script>

<div>
	<SectionHeader title="Analytics" description="Fleet performance over the last 6 months">
		{#snippet action()}
			<Btn variant="ghost" size="sm"><Download size={12} /> Export Report</Btn>
		{/snippet}
	</SectionHeader>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
		<StatCard label="Total Revenue" value={fmtKES(totalRevenue)} sub="Last 6 months" icon={TrendingUp} color="bg-blue-600" />
		<StatCard label="Total Trips" value={totalTrips.toLocaleString()} sub={`${completedTrips} completed this period`} icon={Navigation} color="bg-emerald-600" />
		<StatCard label="Fuel Spend" value={fmtKES(totalFuel)} sub={`${Math.round((totalFuel / totalRevenue) * 100)}% of revenue`} icon={Fuel} color="bg-amber-600" />
		<StatCard label="Avg On-Time Rate" value={`${avgOnTime}%`} sub="Across active drivers" icon={Users} color="bg-violet-600" />
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
		<div class="bg-card border border-border rounded-xl p-5">
			<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Monthly Trip Volume</h3>
			<MonthlyTripsBar />
		</div>
		<div class="bg-card border border-border rounded-xl p-5">
			<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Revenue vs Fuel Cost</h3>
			<RevenueVsFuelLine />
		</div>
	</div>

	<div class="bg-card border border-border rounded-xl p-5">
		<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Driver On-Time Performance</h3>
		<DriverPerfBar />
	</div>
</div>