<script lang="ts">
import { Plus, Search, Download, Trash2, AlertTriangle, Check, Clock, MapPin } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import {
  TRIPS_DATA,
  DRIVERS_DATA,
  VEHICLES_DATA,
  fmtKES,
  BADGE_STYLES,
  BADGE_LABELS,
  type BadgeVariant,
} from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

let trips = $state(TRIPS_DATA.map((t) => ({ ...t })))
let search = $state("")
let filterStatus = $state("all")
let modalOpen = $state(false)
let cancelId = $state<string | null>(null)

const emptyForm = {
  route: "",
  driver: DRIVERS_DATA[0].name,
  vehicle: VEHICLES_DATA[0].plate,
  departure: "",
  passengers: "0",
}
let form = $state({ ...emptyForm })

const filtered = $derived(
  trips.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.route.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || t.status === filterStatus
    return matchSearch && matchStatus
  }),
)

const canEdit = $derived(!!session)

function openAdd() {
  form = { ...emptyForm }
  modalOpen = true
}

function handleSave() {
  if (!form.route || !form.departure) return
  trips = [
    {
      id: `T${String(trips.length + 1).padStart(3, "0")}`,
      route: form.route,
      driver: form.driver,
      vehicle: form.vehicle,
      departure: form.departure,
      arrival: "—",
      distance: 0,
      status: "scheduled",
      passengers: Number(form.passengers),
      revenue: 0,
    },
    ...trips,
  ]
  modalOpen = false
}

function handleCancel(id: string) {
  trips = trips.map((t) => (t.id === id ? { ...t, status: "cancelled" } : t))
  cancelId = null
}

const totalRevenue = $derived(filtered.reduce((s, t) => s + t.revenue, 0))
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 class="text-xl font-bold font-outfit text-foreground">Trip Operations</h1>
      <p class="text-sm text-muted-foreground mt-0.5">
        {trips.length} trips · {fmtKES(totalRevenue)} total revenue (filtered)
      </p>
    </div>
    {#if canEdit}
      <Button variant="default" size="sm" onclick={openAdd}><Plus class="size-3.5 mr-1" /> Schedule Trip</Button>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-3 mb-5">
    <div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
      <Search size={13} class="text-muted-foreground" />
      <input
        bind:value={search}
        placeholder="Search trips…"
        class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
    </div>
    <NativeSelect bind:value={filterStatus} class="w-36 bg-card">
      <option value="all">All Status</option>
      {#each ["scheduled", "in_progress", "completed", "cancelled"] as s (s)}<option value={s}
          >{s.replace("_", " ")}</option
        >{/each}
    </NativeSelect>
    <Button variant="ghost" size="sm"><Download class="size-3 mr-1" /> Export</Button>
  </div>

  {#if filtered.length === 0}
    <div
      class="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 w-full">
      <MapPin class="size-10 text-muted-foreground" />
      <h3 class="text-lg font-semibold">No trips found</h3>
      <p class="text-sm text-muted-foreground">Try adjusting your search or filters, or schedule a new trip.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      {#each filtered as t (t.id)}
        <div class="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="text-xs font-mono text-muted-foreground">{t.id}</div>
              <div class="text-sm font-medium text-foreground mt-0.5">{t.route}</div>
            </div>
            <Badge variant="outline" class={BADGE_STYLES[t.status as BadgeVariant]}>
              {BADGE_LABELS[t.status as BadgeVariant]}
            </Badge>
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Clock size={11} />
            <span class="font-mono">{t.departure} → {t.arrival}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-muted-foreground">Driver</span>
              <div class="text-foreground font-medium">{t.driver}</div>
            </div>
            <div>
              <span class="text-muted-foreground">Vehicle</span>
              <div class="text-foreground font-medium font-mono">{t.vehicle}</div>
            </div>
            <div>
              <span class="text-muted-foreground">Distance</span>
              <div class="text-foreground font-mono">{t.distance} km</div>
            </div>
            <div>
              <span class="text-muted-foreground">Revenue</span>
              <div class="text-foreground font-mono">{fmtKES(t.revenue)}</div>
            </div>
          </div>
          {#if canEdit && (t.status === "scheduled" || t.status === "in_progress")}
            <div class="mt-3 pt-3 border-t border-border flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-auto p-0 text-xs text-destructive hover:bg-transparent"
                onclick={() => (cancelId = t.id)}>Cancel trip</Button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Schedule Trip Modal -->
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Schedule Trip</Dialog.Title>
      </Dialog.Header>
      <div class="grid gap-4 py-2">
        <div class="space-y-1.5">
          <Label for="route" class="text-xs">Route *</Label>
          <Input id="route" bind:value={form.route} placeholder="Nairobi → Mombasa" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label for="driver" class="text-xs">Driver</Label>
            <NativeSelect id="driver" bind:value={form.driver} class="w-full">
              {#each DRIVERS_DATA as d (d.id)}<option value={d.name}>{d.name}</option>{/each}
            </NativeSelect>
          </div>
          <div class="space-y-1.5">
            <Label for="vehicle" class="text-xs">Vehicle</Label>
            <NativeSelect id="vehicle" bind:value={form.vehicle} class="w-full">
              {#each VEHICLES_DATA as v (v.id)}<option value={v.plate}>{v.plate}</option>{/each}
            </NativeSelect>
          </div>
          <div class="space-y-1.5">
            <Label for="departure" class="text-xs">Departure *</Label>
            <Input id="departure" bind:value={form.departure} placeholder="2026-01-15 06:00" />
          </div>
          <div class="space-y-1.5">
            <Label for="passengers" class="text-xs">Expected Passengers</Label>
            <Input id="passengers" type="number" bind:value={form.passengers} />
          </div>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <Button class="flex-1" onclick={handleSave}><Check class="mr-2 size-4" /> Schedule Trip</Button>
        <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
      </div>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Cancel Trip Modal -->
  <Dialog.Root
    open={!!cancelId}
    onOpenChange={(o) => {
      if (!o) cancelId = null
    }}>
    <Dialog.Content class="sm:max-w-[400px]">
      <Dialog.Header>
        <Dialog.Title>Cancel Trip</Dialog.Title>
      </Dialog.Header>
      <div class="space-y-4">
        <div
          class="flex items-start gap-3 p-4 bg-destructive/10 text-destructive border rounded-xl border-destructive/20 text-sm">
          <AlertTriangle class="size-5 shrink-0 mt-0.5" />
          <p>This will mark the trip as cancelled. Passengers and dispatch will need to be notified separately.</p>
        </div>
        <div class="flex gap-3">
          <Button variant="destructive" class="flex-1" onclick={() => cancelId && handleCancel(cancelId)}
            ><Trash2 class="mr-2 size-4" /> Confirm Cancel</Button>
          <Button variant="secondary" onclick={() => (cancelId = null)}>Back</Button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
</div>
