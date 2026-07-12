<script lang="ts">
	import { PieChart } from 'layerchart';
	import { VEHICLE_PIE } from '$lib/data';

	const data = VEHICLE_PIE.map((d) => ({ key: d.name, label: d.name, value: d.value, color: d.color }));
</script>

<div class="h-[160px] w-full">
	<PieChart {data} key="key" value="value" label="label" c="color" innerRadius={45} outerRadius={70} padAngle={0.03} />
</div>
