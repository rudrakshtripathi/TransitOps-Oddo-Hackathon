<script lang="ts">
	import { PieChart } from 'layerchart';
	import { VEHICLE_PIE } from '$lib/data';

	const data = VEHICLE_PIE.map((d) => ({ key: d.name, label: d.name, value: d.value, color: d.color }));
</script>

<div class="h-[160px] w-full">
	<PieChart {data} key="key" value="value" label="label" c="color" innerRadius={45} outerRadius={70} padAngle={0.03} />
</div>
EOF

cat > /home/claude/transitops-svelte/src/lib/components/charts/WeeklyDistanceBar.svelte << 'EOF'
<script lang="ts">
	import { BarChart } from 'layerchart';
	import { WEEKLY_DIST } from '$lib/data';
</script>

<div class="h-[140px] w-full">
	<BarChart
		data={WEEKLY_DIST}
		x="day"
		y="km"
		series={[{ key: 'km', label: 'Distance (km)', color: '#2563EB' }]}
	/>
</div>
EOF

cat > /home/claude/transitops-svelte/src/lib/components/charts/MonthlyTripsBar.svelte << 'EOF'
<script lang="ts">
	import { BarChart } from 'layerchart';
	import { MONTHLY_CHART } from '$lib/data';
</script>

<div class="h-[180px] w-full">
	<BarChart
		data={MONTHLY_CHART}
		x="month"
		y="trips"
		series={[{ key: 'trips', label: 'Trips', color: '#2563EB' }]}
	/>
</div>
EOF

cat > /home/claude/transitops-svelte/src/lib/components/charts/RevenueVsFuelLine.svelte << 'EOF'
<script lang="ts">
	import { LineChart } from 'layerchart';
	import { MONTHLY_CHART } from '$lib/data';
</script>

<div class="h-[180px] w-full">
	<LineChart
		data={MONTHLY_CHART}
		x="month"
		series={[
			{ key: 'revenue', label: 'Revenue', color: '#2563EB' },
			{ key: 'fuel', label: 'Fuel Cost', color: '#F59E0B' }
		]}
		legend
		points
	/>
</div>
EOF

cat > /home/claude/transitops-svelte/src/lib/components/charts/DriverPerfBar.svelte << 'EOF'
<script lang="ts">
	import { BarChart } from 'layerchart';
	import { DRIVER_PERF } from '$lib/data';
</script>

<div class="h-[180px] w-full">
	<BarChart
		data={DRIVER_PERF}
		x="onTime"
		y="name"
		orientation="horizontal"
		series={[{ key: 'onTime', label: 'On-time %', color: '#22C55E' }]}
	/>
</div>