<script lang="ts">
import { BarChart } from "layerchart"

let { data }: { data: { month: string; trips: number }[] } = $props()
</script>

<div class="h-[180px] w-full">
  <BarChart {data} x="month" y="trips" series={[{ key: "trips", label: "Trips", color: "#2563EB" }]} />
</div>
