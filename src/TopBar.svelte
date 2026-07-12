<script lang="ts">
import { Menu, Search, Moon, Sun, Bell, LogOut } from "lucide-svelte"
import { NOTIFICATIONS, type View, type Role } from "$lib/data"
import { cn } from "$lib/utils"
import { fly } from "svelte/transition"

let {
  view,
  role,
  isDark,
  ontogglesidebar,
  ontoggletheme,
  onlogout,
}: {
  view: View
  role: Role
  isDark: boolean
  ontogglesidebar: () => void
  ontoggletheme: () => void
  onlogout: () => void
} = $props()

let search = $state("")
let showNotifs = $state(false)
let notifs = $state(NOTIFICATIONS.map((n) => ({ ...n })))

const unread = $derived(notifs.filter((n) => !n.read).length)

const viewLabels: Record<View, string> = {
  dashboard: "Dashboard",
  vehicles: "Vehicle Fleet",
  drivers: "Driver Registry",
  trips: "Trip Operations",
  maintenance: "Maintenance",
  fuel: "Fuel & Expenses",
  analytics: "Analytics",
  settings: "Settings",
}

function markAllRead() {
  notifs = notifs.map((n) => ({ ...n, read: true }))
}

function markRead(id: number) {
  notifs = notifs.map((n) => (n.id === id ? { ...n, read: true } : n))
}
</script>

<header class="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
  <button onclick={ontogglesidebar} class="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
    <Menu size={16} />
  </button>

  <div class="text-sm font-semibold font-outfit text-foreground hidden sm:block">
    {viewLabels[view]}
  </div>

  <div class="flex-1"></div>

  <div class="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 w-56">
    <Search size={13} class="text-muted-foreground flex-shrink-0" />
    <input
      bind:value={search}
      placeholder="Search…"
      class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
  </div>

  <button onclick={ontoggletheme} class="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
    {#if isDark}
      <Sun size={15} />
    {:else}
      <Moon size={15} />
    {/if}
  </button>

  <div class="relative">
    <button
      onclick={() => (showNotifs = !showNotifs)}
      class="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors relative">
      <Bell size={15} />
      {#if unread > 0}
        <span
          class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {unread}
        </span>
      {/if}
    </button>

    {#if showNotifs}
      <div
        class="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50"
        transition:fly={{ y: -8, duration: 150 }}>
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <span class="text-sm font-semibold font-outfit">Notifications</span>
          <button onclick={markAllRead} class="text-[10px] text-primary hover:underline"> Mark all read </button>
        </div>
        <div class="divide-y divide-border max-h-72 overflow-y-auto">
          {#each notifs as n (n.id)}
            <div
              class={cn("px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors", !n.read && "bg-primary/5")}
              role="presentation"
              onclick={() => markRead(n.id)}>
              <div class="flex items-start gap-2">
                <div
                  class={cn(
                    "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                    n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-emerald-500" : "bg-blue-500",
                  )}>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-foreground leading-relaxed">{n.message}</p>
                  <p class="text-[10px] text-muted-foreground mt-1 font-dm-mono">{n.time}</p>
                </div>
                {#if !n.read}
                  <div class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <button
    onclick={onlogout}
    class="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
    title="Sign out">
    <LogOut size={15} />
  </button>
</header>
