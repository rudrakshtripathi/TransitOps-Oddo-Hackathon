<script lang="ts">
import { AreaChart } from "layerchart"
import { MONTHLY_CHART } from "$lib/data"
</script>

<div class="h-[200px] w-full">
  <AreaChart
    data={MONTHLY_CHART}
    x="month"
    series={[
      { key: "revenue", label: "Revenue", color: "#2563EB" },
      { key: "fuel", label: "Fuel Cost", color: "#F59E0B" },
    ]}
    legend />
</div>
