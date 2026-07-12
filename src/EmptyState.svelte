<script lang="ts">
import type { Icon as IconType } from "lucide-svelte"

let { icon: Icon, title, description }: { icon: typeof IconType; title: string; description: string } = $props()
</script>

<div class="flex flex-col items-center justify-center py-16 text-center col-span-2">
  <div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
    <Icon size={28} class="text-muted-foreground" />
  </div>
  <h3 class="text-sm font-semibold text-foreground font-outfit">{title}</h3>
  <p class="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
</div>
