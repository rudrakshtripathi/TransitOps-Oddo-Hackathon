<script lang="ts">
import { Plus, Search, Download, Edit2, Trash2, AlertTriangle, Check } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import { VEHICLES_DATA, BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

let vehicles = $state(VEHICLES_DATA.map((v) => ({ ...v })))
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
}
let form = $state({ ...emptyForm })

const filtered = $derived(
  vehicles.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      v.plate.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.driver.toLowerCase().includes(q)
    const matchType = filterType === "all" || v.type === filterType
    const matchStatus = filterStatus === "all" || v.status === filterStatus
    return matchSearch && matchType && matchStatus
  }),
)

const canEdit = $derived(!!session)

function openAdd() {
  editId = null
  form = { ...emptyForm }
  modalOpen = true
}

function openEdit(v: (typeof VEHICLES_DATA)[0]) {
  editId = v.id
  form = {
    plate: v.plate,
    make: v.make,
    model: v.model,
    year: String(v.year),
    type: v.type,
    capacity: String(v.capacity),
    status: v.status,
    fuel: v.fuel,
  }
  modalOpen = true
}

function handleSave() {
  if (!form.plate || !form.make || !form.model) return
  if (editId) {
    vehicles = vehicles.map((v) =>
      v.id === editId ? { ...v, ...form, year: Number(form.year), capacity: Number(form.capacity) } : v,
    )
  } else {
    vehicles = [
      {
        ...form,
        id: `V${String(vehicles.length + 1).padStart(3, "0")}`,
        year: Number(form.year),
        capacity: Number(form.capacity),
        driver: "—",
        mileage: 0,
        lastService: "—",
      },
      ...vehicles,
    ]
  }
  modalOpen = false
}

function handleDelete(id: string) {
  vehicles = vehicles.filter((v) => v.id !== id)
  deleteId = null
}
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 class="text-xl font-bold font-outfit text-foreground">Vehicle Fleet</h1>
      <p class="text-sm text-muted-foreground mt-0.5">{vehicles.length} registered vehicles</p>
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

  <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/40">
            {#each ["ID", "Plate", "Vehicle", "Type", "Status", "Driver", "Mileage", "Last Service", ""] as h (h)}
              <th
                class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                >{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#if filtered.length === 0}
            <tr
              ><td colspan="9" class="py-16 text-center text-sm text-muted-foreground"
                >No vehicles match your filters</td
              ></tr>
          {:else}
            {#each filtered as v (v.id)}
              <tr class="hover:bg-muted/30 transition-colors">
                <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{v.id}</td>
                <td class="px-4 py-3 font-mono text-xs font-medium text-foreground">{v.plate}</td>
                <td class="px-4 py-3">
                  <div class="font-medium text-foreground text-xs">{v.make} {v.model}</div>
                  <div class="text-[10px] text-muted-foreground">{v.year} · {v.fuel}</div>
                </td>
                <td class="px-4 py-3 text-xs text-muted-foreground">{v.type}</td>
                <td class="px-4 py-3">
                  <Badge variant="outline" class={BADGE_STYLES[v.status as BadgeVariant]}>
                    {BADGE_LABELS[v.status as BadgeVariant]}
                  </Badge>
                </td>
                <td class="px-4 py-3 text-xs text-foreground">{v.driver}</td>
                <td class="px-4 py-3 text-xs font-mono text-foreground">{v.mileage.toLocaleString()} km</td>
                <td class="px-4 py-3 text-xs font-mono text-muted-foreground">{v.lastService}</td>
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
      Showing {filtered.length} of {vehicles.length} vehicles
    </div>
  </div>

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
            <Label for="year" class="text-xs">Year</Label>
            <Input id="year" type="number" bind:value={form.year} />
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
          <div class="space-y-1.5">
            <Label for="fuel" class="text-xs">Fuel Type</Label>
            <NativeSelect id="fuel" bind:value={form.fuel} class="w-full">
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </NativeSelect>
          </div>
          <div class="space-y-1.5">
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
