<script lang="ts">
import { cn } from "$lib/utils"

let {
  value = $bindable(""),
  type = "text",
  placeholder = "",
  class: className = "",
}: {
  value?: string | number
  type?: string
  placeholder?: string
  class?: string
} = $props()
</script>

<input
  {type}
  {placeholder}
  bind:value
  class={cn(
    "w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors",
    className,
  )} />
