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
