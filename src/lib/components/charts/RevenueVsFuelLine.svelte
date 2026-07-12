<script lang="ts">
import { LineChart } from "layerchart"

let { data }: { data: { month: string; fuel: number; maintenance: number }[] } = $props()
</script>

<div class="h-[180px] w-full">
  <LineChart
    {data}
    x="month"
    series={[
      { key: "fuel", label: "Fuel Cost", color: "#F59E0B" },
      { key: "maintenance", label: "Maintenance", color: "#EF4444" },
    ]}
    legend
    points />
</div>
