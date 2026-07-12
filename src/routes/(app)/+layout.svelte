<script lang="ts">
import { page } from "$app/state"
import { resolve } from "$app/paths"
import { LayoutDashboard, Truck, Users, Navigation, Wrench, Fuel, BarChart3, Settings, Menu, X } from "@lucide/svelte"
import AccountDropdown from "$lib/components/reusable/AccountDropdown.svelte"
import ColorModeToggle from "$lib/components/reusable/ColorModeToggle.svelte"
import { Button } from "$lib/components/ui/button"

let { data, children } = $props()
let { session, user, supabase } = $derived(data)

let mobileMenuOpen = $state(false)

const navItems = [
  { id: "dashboard", name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { id: "divider-fleet", label: "Fleet", isDivider: true },
  { id: "vehicles", name: "Vehicles", href: "/app/vehicles", icon: Truck },
  { id: "drivers", name: "Drivers", href: "/app/drivers", icon: Users },
  { id: "divider-ops", label: "Operations", isDivider: true },
  { id: "trips", name: "Trips", href: "/app/trips", icon: Navigation },
  { id: "maintenance", name: "Maintenance", href: "/app/maintenance", icon: Wrench },
  { id: "fuel", name: "Fuel & Expenses", href: "/app/fuel", icon: Fuel },
  { id: "divider-insights", label: "Insights", isDivider: true },
  { id: "analytics", name: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { id: "divider-system", label: "System", isDivider: true },
  { id: "settings", name: "Settings", href: "/app/settings", icon: Settings },
]
</script>

<div class="min-h-screen bg-background flex flex-col md:flex-row">
  <!-- Sidebar for Desktop -->
  <aside class="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0">
    <div class="h-16 flex items-center px-6 border-b border-border gap-2">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Truck size={15} class="text-white" />
      </div>
      <span class="text-lg font-bold tracking-tight text-foreground font-heading">TransitOps</span>
    </div>
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      {#each navItems as item}
        {#if item.isDivider}
          <div class="px-3 pt-4 pb-1">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {item.label}
            </span>
          </div>
        {:else}
          {@const active = page.url.pathname === item.href}
          <a
            href={item.href}
            class={[
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ]}>
            <item.icon class="size-4" />
            {item.name}
          </a>
        {/if}
      {/each}
    </nav>
    <div class="p-4 border-t border-border flex flex-col gap-2">
      {#if session && user}
        <div class="flex items-center justify-between gap-2">
          <AccountDropdown {session} {user} {supabase} />
          <ColorModeToggle />
        </div>
      {/if}
    </div>
  </aside>

  <!-- Mobile Header -->
  <header class="md:hidden h-16 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
    <a href="/app" class="flex items-center gap-2">
      <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
        <Truck size={13} class="text-white" />
      </div>
      <span class="text-md font-bold tracking-tight text-foreground font-heading">TransitOps</span>
    </a>
    <div class="flex items-center gap-2">
      <ColorModeToggle />
      {#if session && user}
        <AccountDropdown {session} {user} {supabase} />
      {/if}
      <Button variant="ghost" size="icon" onclick={() => (mobileMenuOpen = !mobileMenuOpen)}>
        {#if mobileMenuOpen}
          <X class="size-5" />
        {:else}
          <Menu class="size-5" />
        {/if}
      </Button>
    </div>
  </header>

  <!-- Mobile Nav Drawer -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-b border-border bg-card max-h-[75vh] overflow-y-auto">
      <nav class="p-4 space-y-1">
        {#each navItems as item}
          {#if item.isDivider}
            <div class="px-3 pt-3 pb-1">
              <span class="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                {item.label}
              </span>
            </div>
          {:else}
            {@const active = page.url.pathname === item.href}
            <a
              href={item.href}
              onclick={() => (mobileMenuOpen = false)}
              class={[
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ]}>
              <item.icon class="size-4" />
              {item.name}
            </a>
          {/if}
        {/each}
      </nav>
    </div>
  {/if}

  <!-- Main Content Area -->
  <main class="flex-1 overflow-y-auto p-4 md:p-8">
    {@render children?.()}
  </main>
</div>
