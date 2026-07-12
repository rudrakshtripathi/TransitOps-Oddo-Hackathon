<script lang="ts">
import { LineChart } from "layerchart"
import { MONTHLY_CHART } from "$lib/data"
</script>

<div class="h-[180px] w-full">
  <LineChart
    data={MONTHLY_CHART}
    x="month"
    series={[
      { key: "revenue", label: "Revenue", color: "#2563EB" },
      { key: "fuel", label: "Fuel Cost", color: "#F59E0B" },
    ]}
    legend
    points />
</div>
