<script lang="ts">
import { BarChart } from "layerchart"

let { data }: { data: { name: string; trips: number; safetyScore: number }[] } = $props()
</script>

<div class="h-[180px] w-full">
  <BarChart
    {data}
    x="safetyScore"
    y="name"
    orientation="horizontal"
    series={[{ key: "safetyScore", label: "Safety Score", color: "#22C55E" }]} />
</div>
