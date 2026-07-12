<script lang="ts">
import { BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"
import { cn } from "$lib/utils"

let { status }: { status: BadgeVariant } = $props()
</script>

<span
  class={cn(
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-dm-mono tracking-wide",
    BADGE_STYLES[status],
  )}>
  {BADGE_LABELS[status]}
</span>
