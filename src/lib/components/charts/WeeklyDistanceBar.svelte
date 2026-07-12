<script lang="ts">
import { BarChart } from "layerchart"

let { data }: { data: { day: string; km: number }[] } = $props()
</script>

<div class="h-[140px] w-full">
  <BarChart {data} x="day" y="km" series={[{ key: "km", label: "Distance (km)", color: "#2563EB" }]} />
</div>
