<script lang="ts">
import { Plus, Search, Download, Edit2, Trash2, AlertTriangle, Check } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from "$lib/api/vehicles.remote"
import { BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

let vehiclesPromise = $state(getVehicles())

let search = $state("")
let filterType = $state("all")
let filterStatus = $state("all")
let modalOpen = $state(false)
let editId = $state<string | null>(null)
let deleteId = $state<string | null>(null)

const emptyForm = {
  plate: "",
  make: "",
  model: "",
  year: "2024",
  type: "Van",
  capacity: "15",
  status: "active",
  fuel: "Diesel",
  mileage: "0",
}
let form = $state({ ...emptyForm })

const canEdit = $derived(!!session)

function openAdd() {
  editId = null
  form = { ...emptyForm }
  modalOpen = true
}

function openEdit(v: any) {
  editId = v.id
  const parts = v.name.split(" ")
  const make = parts[0] || ""
  const model = parts.slice(1).join(" ") || ""
  form = {
    plate: v.registrationNumber,
    make,
    model,
    year: "2024",
    type: v.type,
    capacity: String(v.maxLoadCapacity),
    status: v.status,
    fuel: "Diesel",
    mileage: String(v.odometer),
  }
  modalOpen = true
}

async function handleSave() {
  if (!form.plate || !form.make || !form.model) return

  const payload = {
    registrationNumber: form.plate,
    name: `${form.make} ${form.model}`,
    type: form.type,
    maxLoadCapacity: form.capacity,
    status: form.status as any,
    acquisitionCost: "1500000",
    odometer: form.mileage,
  }

  if (editId) {
    await updateVehicle({ id: editId, vehicle: payload })
  } else {
    await createVehicle(payload)
  }

  // Refresh the data promise
  vehiclesPromise = getVehicles()
  modalOpen = false
}

async function handleDelete(id: string) {
  await deleteVehicle(id)
  vehiclesPromise = getVehicles()
  deleteId = null
}

function filterVehicles(list: any[]) {
  return list.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      v.registrationNumber.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q)
    const matchType = filterType === "all" || v.type === filterType
    const matchStatus = filterStatus === "all" || v.status === filterStatus
    return matchSearch && matchType && matchStatus
  })
}
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 class="text-xl font-bold font-outfit text-foreground">Vehicle Fleet</h1>
      <p class="text-sm text-muted-foreground mt-0.5">Manage registered vehicles</p>
    </div>
    {#if canEdit}
      <Button variant="default" size="sm" onclick={openAdd}><Plus class="size-3.5 mr-1" /> Add Vehicle</Button>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-3 mb-5">
    <div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
      <Search size={13} class="text-muted-foreground" />
      <input
        bind:value={search}
        placeholder="Search vehicles…"
        class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
    </div>
    <NativeSelect bind:value={filterType} class="w-36 bg-card">
      <option value="all">All Types</option>
      {#each ["Bus", "Truck", "Van"] as t (t)}<option value={t}>{t}</option>{/each}
    </NativeSelect>
    <NativeSelect bind:value={filterStatus} class="w-36 bg-card">
      <option value="all">All Status</option>
      {#each ["active", "idle", "maintenance", "retired"] as s (s)}<option value={s}>{s}</option>{/each}
    </NativeSelect>
    <Button variant="ghost" size="sm"><Download class="size-3 mr-1" /> Export</Button>
  </div>

  <svelte:boundary>
    {#await vehiclesPromise}
      <div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
        Loading vehicles from database...
      </div>
    {:then res}
      {#if res.error}
        <div class="py-16 text-center text-sm text-destructive bg-destructive/10 border rounded-xl">
          Error loading vehicles: {res.error}
        </div>
      {:else if res.data}
        {@const filtered = filterVehicles(res.data)}
        <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  {#each ["ID", "Plate", "Vehicle", "Type", "Status", "Mileage", ""] as h (h)}
                    <th
                      class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                      >{h}</th>
                  {/each}
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                {#if filtered.length === 0}
                  <tr
                    ><td colspan="7" class="py-16 text-center text-sm text-muted-foreground"
                      >No vehicles match your filters</td
                    ></tr>
                {:else}
                  {#each filtered as v (v.id)}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{v.id.slice(0, 8)}</td>
                      <td class="px-4 py-3 font-mono text-xs font-medium text-foreground">{v.registrationNumber}</td>
                      <td class="px-4 py-3">
                        <div class="font-medium text-foreground text-xs">{v.name}</div>
                      </td>
                      <td class="px-4 py-3 text-xs text-muted-foreground">{v.type}</td>
                      <td class="px-4 py-3">
                        <Badge variant="outline" class={BADGE_STYLES[v.status as BadgeVariant]}>
                          {BADGE_LABELS[v.status as BadgeVariant]}
                        </Badge>
                      </td>
                      <td class="px-4 py-3 text-xs font-mono text-foreground"
                        >{Number(v.odometer).toLocaleString()} km</td>
                      <td class="px-4 py-3">
                        {#if canEdit}
                          <div class="flex items-center gap-1 justify-end">
                            <Button variant="ghost" size="icon" class="size-7" onclick={() => openEdit(v)}
                              ><Edit2 class="size-3.5" /></Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="size-7 text-destructive hover:bg-destructive/10"
                              onclick={() => (deleteId = v.id)}><Trash2 class="size-3.5" /></Button>
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
            Showing {filtered.length} of {res.data.length} vehicles
          </div>
        </div>
      {/if}
    {/await}

    {#snippet pending()}
      <div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">Loading...</div>
    {/snippet}

    {#snippet failed(error: any, reset: any)}
      <div
        class="py-16 text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl space-y-2">
        <p>Failed to load vehicles: {error?.message || error}</p>
        <Button variant="outline" size="sm" onclick={reset}>Retry</Button>
      </div>
    {/snippet}
  </svelte:boundary>

  <!-- Add / Edit Modal -->
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>{editId ? "Edit Vehicle" : "Add Vehicle"}</Dialog.Title>
      </Dialog.Header>
      <div class="grid gap-4 py-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label for="plate" class="text-xs">License Plate *</Label>
            <Input id="plate" bind:value={form.plate} placeholder="KAA 123A" />
          </div>
          <div class="space-y-1.5">
            <Label for="mileage" class="text-xs">Odometer (km)</Label>
            <Input id="mileage" type="number" bind:value={form.mileage} />
          </div>
          <div class="space-y-1.5">
            <Label for="make" class="text-xs">Make *</Label>
            <Input id="make" bind:value={form.make} placeholder="Toyota" />
          </div>
          <div class="space-y-1.5">
            <Label for="model" class="text-xs">Model *</Label>
            <Input id="model" bind:value={form.model} placeholder="HiAce" />
          </div>
          <div class="space-y-1.5">
            <Label for="type" class="text-xs">Type</Label>
            <NativeSelect id="type" bind:value={form.type} class="w-full">
              <option value="Bus">Bus</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
            </NativeSelect>
          </div>
          <div class="space-y-1.5">
            <Label for="capacity" class="text-xs">Capacity (seats)</Label>
            <Input id="capacity" type="number" bind:value={form.capacity} />
          </div>
          <div class="space-y-1.5 col-span-2">
            <Label for="status" class="text-xs">Status</Label>
            <NativeSelect id="status" bind:value={form.status} class="w-full">
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </NativeSelect>
          </div>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <Button class="flex-1" onclick={handleSave}
          ><Check class="mr-2 size-4" /> {editId ? "Save Changes" : "Add Vehicle"}</Button>
        <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
      </div>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Delete Modal -->
  <Dialog.Root
    open={!!deleteId}
    onOpenChange={(o) => {
      if (!o) deleteId = null
    }}>
    <Dialog.Content class="sm:max-w-[400px]">
      <Dialog.Header>
        <Dialog.Title>Delete Vehicle</Dialog.Title>
      </Dialog.Header>
      <div class="space-y-4">
        <div
          class="flex items-start gap-3 p-4 bg-destructive/10 text-destructive border rounded-xl border-destructive/20 text-sm">
          <AlertTriangle class="size-5 shrink-0 mt-0.5" />
          <p>This action cannot be undone. The vehicle record and associated data will be permanently deleted.</p>
        </div>
        <div class="flex gap-3">
          <Button variant="destructive" class="flex-1" onclick={() => deleteId && handleDelete(deleteId)}
            ><Trash2 class="mr-2 size-4" /> Confirm Delete</Button>
          <Button variant="secondary" onclick={() => (deleteId = null)}>Cancel</Button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
</div>
