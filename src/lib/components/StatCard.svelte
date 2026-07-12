<script lang="ts">
import type { Component } from "svelte"
let {
  label,
  value,
  sub,
  trend,
  icon: Icon,
  color = "bg-primary",
}: {
  label: string
  value: string | number
  sub?: string
  trend?: number
  icon?: Component<any>
  color?: string
} = $props()

const isPositive = $derived(trend !== undefined && trend > 0)
</script>

<div class="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
  {#if Icon}
    <div class="{color} p-2.5 rounded-xl shrink-0">
      <Icon size={18} class="text-white" />
    </div>
  {/if}
  <div class="flex-1 min-w-0">
    <p class="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p class="text-xl font-bold text-foreground font-mono">{value}</p>
    {#if sub || trend !== undefined}
      <p class="text-[11px] text-muted-foreground mt-0.5">
        {#if trend !== undefined}
          <span class={isPositive ? "text-emerald-500" : "text-red-400"}>{isPositive ? "+" : ""}{trend}%</span>
          {#if sub}
            ·
          {/if}
        {/if}
        {#if sub}{sub}{/if}
      </p>
    {/if}
  </div>
</div>
