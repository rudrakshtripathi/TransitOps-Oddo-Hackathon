<script lang="ts">
import { BarChart } from "layerchart"
import { WEEKLY_DIST } from "$lib/data"
</script>

<div class="h-[140px] w-full">
  <BarChart data={WEEKLY_DIST} x="day" y="km" series={[{ key: "km", label: "Distance (km)", color: "#2563EB" }]} />
</div>
