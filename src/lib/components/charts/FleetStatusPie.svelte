<script lang="ts">
import { PieChart } from "layerchart"

let { data }: { data: { name: string; value: number; color: string }[] } = $props()

const chartData = $derived(data.map((d) => ({ key: d.name, label: d.name, value: d.value, color: d.color })))
</script>

<div class="h-[160px] w-full">
  <PieChart data={chartData} key="key" value="value" label="label" c="color" innerRadius={45} outerRadius={70} padAngle={0.03} />
</div>
