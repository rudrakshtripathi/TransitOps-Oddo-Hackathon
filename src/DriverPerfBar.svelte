<script lang="ts">
import { BarChart } from "layerchart"
import { DRIVER_PERF } from "$lib/data"
</script>

<div class="h-[180px] w-full">
  <BarChart
    data={DRIVER_PERF}
    x="onTime"
    y="name"
    orientation="horizontal"
    series={[{ key: "onTime", label: "On-time %", color: "#22C55E" }]} />
</div>
