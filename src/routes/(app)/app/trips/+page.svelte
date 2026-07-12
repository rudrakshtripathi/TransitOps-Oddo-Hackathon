<script lang="ts">
import { Plus, Search, Download, Trash2, AlertTriangle, Check, MapPin, Navigation } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import { getTrips, createTrip, updateTrip, deleteTrip } from "$lib/api/trips.remote"
import { getVehicles } from "$lib/api/vehicles.remote"
import { getDrivers } from "$lib/api/drivers.remote"
import { BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

// Load trips, vehicles, and drivers reactively
let dataPromise = $state(Promise.all([getTrips(), getVehicles(), getDrivers()]))

let search = $state("")
let filterStatus = $state("all")
let modalOpen = $state(false)
let cancelId = $state<string | null>(null)

const emptyForm = { source: "", destination: "", driverId: "", vehicleId: "", distance: "100", cargoWeight: "5" }
let form = $state({ ...emptyForm })

const canEdit = $derived(!!session)

function openAdd(vehicles: any[], drivers: any[]) {
  form = {
    source: "",
    destination: "",
    driverId: drivers[0]?.id || "",
    vehicleId: vehicles[0]?.id || "",
    distance: "100",
    cargoWeight: "5",
  }
  modalOpen = true
}

async function handleSave() {
  if (!form.source || !form.destination || !form.driverId || !form.vehicleId) return

  const payload = {
    source: form.source,
    destination: form.destination,
    driverId: form.driverId,
    vehicleId: form.vehicleId,
    plannedDistance: form.distance,
    cargoWeight: form.cargoWeight,
    status: "scheduled" as any,
  }

  await createTrip(payload)
  dataPromise = Promise.all([getTrips(), getVehicles(), getDrivers()])
  modalOpen = false
}

async function handleCancel(id: string) {
  await updateTrip({ id, trip: { status: "cancelled" as any } })
  dataPromise = Promise.all([getTrips(), getVehicles(), getDrivers()])
  cancelId = null
}

function filterTrips(list: any[]) {
  return list.filter((t) => {
    const q = search.toLowerCase()
    const routeStr = `${t.source} ${t.destination}`.toLowerCase()
    const matchSearch =
      !q || routeStr.includes(q) || t.driverName.toLowerCase().includes(q) || t.vehiclePlate.toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || t.status === filterStatus
    return matchSearch && matchStatus
  })
}
</script>

<div class="space-y-6">
  <svelte:boundary>
    {#await dataPromise}
      <div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
        Loading trips operations...
      </div>
    {:then [tripsRes, vehiclesRes, driversRes]}
      {#if tripsRes.error || vehiclesRes.error || driversRes.error}
        <div class="py-16 text-center text-sm text-destructive bg-destructive/10 border rounded-xl">
          Error loading data
        </div>
      {:else}
        {@const tripsList = tripsRes.data || []}
        {@const vehiclesList = vehiclesRes.data || []}
        {@const driversList = driversRes.data || []}
        {@const filtered = filterTrips(tripsList)}

        <div class="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 class="text-xl font-bold font-outfit text-foreground">Trips Operations</h1>
            <p class="text-sm text-muted-foreground mt-0.5">Manage live dispatches and schedules</p>
          </div>
          {#if canEdit}
            <Button variant="default" size="sm" onclick={() => openAdd(vehiclesList, driversList)}
              ><Plus class="size-3.5 mr-1" /> Dispatch Trip</Button>
          {/if}
        </div>

        <div class="flex flex-wrap items-center gap-3 mb-5">
          <div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
            <Search size={13} class="text-muted-foreground" />
            <input
              bind:value={search}
              placeholder="Search routes, drivers, vehicles…"
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

        <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  {#each ["ID", "Route", "Driver", "Vehicle", "Distance", "Status", ""] as h (h)}
                    <th
                      class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                      >{h}</th>
                  {/each}
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                {#if filtered.length === 0}
                  <tr><td colspan="7" class="py-16 text-center text-sm text-muted-foreground">No trips found</td></tr>
                {:else}
                  {#each filtered as t (t.id)}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id.slice(0, 8)}</td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2 text-xs">
                          <Navigation size={11} class="text-primary" />
                          <span class="font-medium text-foreground">{t.source} → {t.destination}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-xs text-foreground font-medium">{t.driverName}</td>
                      <td class="px-4 py-3 text-xs font-mono text-muted-foreground">{t.vehiclePlate}</td>
                      <td class="px-4 py-3 text-xs font-mono text-foreground"
                        >{Number(t.plannedDistance).toLocaleString()} km</td>
                      <td class="px-4 py-3">
                        <Badge variant="outline" class={BADGE_STYLES[t.status as BadgeVariant]}>
                          {BADGE_LABELS[t.status as BadgeVariant]}
                        </Badge>
                      </td>
                      <td class="px-4 py-3">
                        {#if canEdit && (t.status === "scheduled" || t.status === "in_progress")}
                          <div class="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              class="h-7 text-xs text-destructive hover:bg-destructive/10"
                              onclick={() => (cancelId = t.id)}>Cancel</Button>
                          </div>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">
            Showing {filtered.length} of {tripsList.length} dispatches
          </div>
        </div>

        <!-- Add / Edit Modal -->
        <Dialog.Root bind:open={modalOpen}>
          <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
              <Dialog.Title>Dispatch New Trip</Dialog.Title>
            </Dialog.Header>
            <div class="grid gap-4 py-2">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <Label for="source" class="text-xs">Origin *</Label>
                  <div class="flex items-center gap-2 bg-muted/20 border rounded-lg px-3 py-1.5">
                    <MapPin size={13} class="text-muted-foreground" />
                    <input
                      id="source"
                      bind:value={form.source}
                      placeholder="Nairobi"
                      class="bg-transparent text-sm w-full focus:outline-none" />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <Label for="destination" class="text-xs">Destination *</Label>
                  <div class="flex items-center gap-2 bg-muted/20 border rounded-lg px-3 py-1.5">
                    <MapPin size={13} class="text-muted-foreground" />
                    <input
                      id="destination"
                      bind:value={form.destination}
                      placeholder="Mombasa"
                      class="bg-transparent text-sm w-full focus:outline-none" />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <Label for="vehicle" class="text-xs">Vehicle *</Label>
                  <NativeSelect id="vehicle" bind:value={form.vehicleId} class="w-full bg-card">
                    {#each vehiclesList as v (v.id)}
                      <option value={v.id}>{v.registrationNumber} ({v.name})</option>
                    {/each}
                  </NativeSelect>
                </div>
                <div class="space-y-1.5">
                  <Label for="driver" class="text-xs">Driver *</Label>
                  <NativeSelect id="driver" bind:value={form.driverId} class="w-full bg-card">
                    {#each driversList as d (d.id)}
                      <option value={d.id}>{d.name}</option>
                    {/each}
                  </NativeSelect>
                </div>
                <div class="space-y-1.5">
                  <Label for="distance" class="text-xs">Distance (km)</Label>
                  <Input id="distance" type="number" bind:value={form.distance} />
                </div>
                <div class="space-y-1.5">
                  <Label for="weight" class="text-xs">Cargo Weight (tons)</Label>
                  <Input id="weight" type="number" bind:value={form.cargoWeight} />
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <Button class="flex-1" onclick={handleSave}><Check class="mr-2 size-4" /> Dispatch Trip</Button>
              <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
            </div>
          </Dialog.Content>
        </Dialog.Root>

        <!-- Cancel Modal -->
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
                <p>Are you sure you want to cancel this trip? The status will be set to Cancelled.</p>
              </div>
              <div class="flex gap-3">
                <Button variant="destructive" class="flex-1" onclick={() => cancelId && handleCancel(cancelId)}
                  ><Trash2 class="mr-2 size-4" /> Confirm Cancel</Button>
                <Button variant="secondary" onclick={() => (cancelId = null)}>Go Back</Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      {/if}
    {/await}

    {#snippet pending()}
      <div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">Loading...</div>
    {/snippet}

    {#snippet failed(error: any, reset: any)}
      <div
        class="py-16 text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
        <p>Failed to load trips operations: {error?.message || error}</p>
        <Button variant="outline" size="sm" onclick={reset}>Retry</Button>
      </div>
    {/snippet}
  </svelte:boundary>
</div>
