<script lang="ts">
import { AreaChart } from "layerchart"

let { data }: { data: { month: string; fuel: number; maintenance: number }[] } = $props()
</script>

<div class="h-[200px] w-full">
  <AreaChart
    {data}
    x="month"
    series={[
      { key: "fuel", label: "Fuel Cost", color: "#F59E0B" },
      { key: "maintenance", label: "Maintenance", color: "#EF4444" },
    ]}
    legend />
</div>
