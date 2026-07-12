<script lang="ts">
import { Download, TrendingUp, Navigation, Fuel, Users } from "@lucide/svelte"
import StatCard from "$lib/components/StatCard.svelte"
import { Button } from "$lib/components/ui/button"
import MonthlyTripsBar from "$lib/components/charts/MonthlyTripsBar.svelte"
import RevenueVsFuelLine from "$lib/components/charts/RevenueVsFuelLine.svelte"
import DriverPerfBar from "$lib/components/charts/DriverPerfBar.svelte"
import {
	getMonthlyStats,
	getDriverPerformance,
} from "$lib/api/analytics.remote"
import { getTrips } from "$lib/api/trips.remote"

const emptyResult = { data: [], error: "Failed" }
const monthlyPromise = getMonthlyStats().catch(() => emptyResult)
const driverPerfPromise = getDriverPerformance().catch(() => emptyResult)
const tripsPromise = getTrips().catch(() => emptyResult)

let analyticsPromise = Promise.all([monthlyPromise, driverPerfPromise, tripsPromise])

function fmtKES(n: number) {
	if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `KES ${(n / 1_000).toFixed(1)}K`
	return `KES ${n}`
}
</script>

<div class="space-y-6">
	<svelte:boundary>
		{#await analyticsPromise}
			<div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
				Loading analytics...
			</div>
		{:then [monthlyRes, driverPerfRes, tripsRes]}
			{@const monthly = monthlyRes.data || []}
			{@const driverPerf = driverPerfRes.data || []}
			{@const trips = tripsRes.data || []}

			{@const totalTrips = monthly.reduce((s, m) => s + m.trips, 0)}
			{@const totalFuel = monthly.reduce((s, m) => s + m.fuel, 0)}
			{@const totalMaintenance = monthly.reduce((s, m) => s + m.maintenance, 0)}
			{@const avgSafety = driverPerf.length ? Math.round(driverPerf.reduce((s, d) => s + d.safetyScore, 0) / driverPerf.length) : 0}
			{@const completedTrips = trips.filter(t => t.status === 'completed').length}

			<div class="flex items-start justify-between mb-6 gap-4">
				<div>
					<h1 class="text-xl font-bold font-outfit text-foreground">Analytics</h1>
					<p class="text-sm text-muted-foreground mt-0.5">Fleet performance over the last 6 months</p>
				</div>
				<Button variant="ghost" size="sm"><Download class="size-3 mr-1" /> Export Report</Button>
			</div>

			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<StatCard
					label="Total Trips"
					value={totalTrips.toLocaleString()}
					sub={`${completedTrips} completed this period`}
					icon={Navigation}
					color="bg-emerald-600" />
				<StatCard
					label="Fuel Spend"
					value={fmtKES(totalFuel)}
					sub="Last 6 months"
					icon={Fuel}
					color="bg-amber-600" />
				<StatCard
					label="Maintenance Spend"
					value={fmtKES(totalMaintenance)}
					sub="Last 6 months"
					icon={TrendingUp}
					color="bg-blue-600" />
				<StatCard
					label="Avg Safety Score"
					value={`${avgSafety}/100`}
					sub="Across top drivers"
					icon={Users}
					color="bg-violet-600" />
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
				<div class="bg-card border border-border rounded-xl p-5 shadow-sm">
					<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Monthly Trip Volume</h3>
					<MonthlyTripsBar data={monthly} />
				</div>
				<div class="bg-card border border-border rounded-xl p-5 shadow-sm">
					<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Fuel vs Maintenance Cost</h3>
					<RevenueVsFuelLine data={monthly} />
				</div>
			</div>

			<div class="bg-card border border-border rounded-xl p-5 shadow-sm">
				<h3 class="text-sm font-semibold font-outfit text-card-foreground mb-4">Driver Safety Performance (Top 5)</h3>
				<DriverPerfBar data={driverPerf} />
			</div>
		{/await}

		{#snippet pending()}
			<div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
				Loading...
			</div>
		{/snippet}

		{#snippet failed(error: any, reset: any)}
			<div class="py-16 text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
				<p>Failed to load analytics: {error?.message || error}</p>
				<Button variant="outline" size="sm" onclick={reset}>Retry</Button>
			</div>
		{/snippet}
	</svelte:boundary>
</div>
