<script lang="ts">
import { Plus, Search, Download, Edit2, Trash2, AlertTriangle, Check, User, Star } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import { DRIVERS_DATA, BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

let drivers = $state(DRIVERS_DATA.map((d) => ({ ...d })))
let search = $state("")
let filterStatus = $state("all")
let modalOpen = $state(false)
let editId = $state<string | null>(null)
let deleteId = $state<string | null>(null)

const emptyForm = { name: "", email: "", phone: "", license: "", licenseClass: "C", status: "active" }
let form = $state({ ...emptyForm })

const filtered = $derived(
  drivers.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q || d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.license.toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || d.status === filterStatus
    return matchSearch && matchStatus
  }),
)

const canEdit = $derived(!!session)

function openAdd() {
  editId = null
  form = { ...emptyForm }
  modalOpen = true
}

function openEdit(d: (typeof DRIVERS_DATA)[0]) {
  editId = d.id
  form = {
    name: d.name,
    email: d.email,
    phone: d.phone,
    license: d.license,
    licenseClass: d.licenseClass,
    status: d.status,
  }
  modalOpen = true
}

function handleSave() {
  if (!form.name || !form.email) return
  if (editId) {
    drivers = drivers.map((d) => (d.id === editId ? { ...d, ...form } : d))
  } else {
    drivers = [
      {
        ...form,
        id: `D${String(drivers.length + 1).padStart(3, "0")}`,
        joined: new Date().toISOString().slice(0, 10),
        trips: 0,
        rating: 5.0,
        vehicle: "—",
        experience: 0,
      },
      ...drivers,
    ]
  }
  modalOpen = false
}

function handleDelete(id: string) {
  drivers = drivers.filter((d) => d.id !== id)
  deleteId = null
}
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 class="text-xl font-bold font-outfit text-foreground">Driver Registry</h1>
      <p class="text-sm text-muted-foreground mt-0.5">{drivers.length} registered drivers</p>
    </div>
    {#if canEdit}
      <Button variant="default" size="sm" onclick={openAdd}><Plus class="size-3.5 mr-1" /> Add Driver</Button>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-3 mb-5">
    <div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
      <Search size={13} class="text-muted-foreground" />
      <input
        bind:value={search}
        placeholder="Search drivers…"
        class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
    </div>
    <NativeSelect bind:value={filterStatus} class="w-36 bg-card">
      <option value="all">All Status</option>
      {#each ["active", "on_leave", "inactive"] as s (s)}<option value={s}>{s.replace("_", " ")}</option>{/each}
    </NativeSelect>
    <Button variant="ghost" size="sm"><Download class="size-3 mr-1" /> Export</Button>
  </div>

  <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/40">
            {#each ["Driver", "License", "Class", "Contact", "Status", "Vehicle", "Trips", "Rating", ""] as h (h)}
              <th
                class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                >{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each filtered as d (d.id)}
            <tr class="hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <User size={12} class="text-primary" />
                  </div>
                  <div>
                    <div class="text-xs font-medium text-foreground">{d.name}</div>
                    <div class="text-[10px] text-muted-foreground">{d.experience}y exp</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-xs font-mono text-muted-foreground">{d.license}</td>
              <td class="px-4 py-3 text-xs font-mono font-medium text-foreground">{d.licenseClass}</td>
              <td class="px-4 py-3">
                <div class="text-xs text-foreground">{d.phone}</div>
                <div class="text-[10px] text-muted-foreground">{d.email}</div>
              </td>
              <td class="px-4 py-3">
                <Badge variant="outline" class={BADGE_STYLES[d.status as BadgeVariant]}>
                  {BADGE_LABELS[d.status as BadgeVariant]}
                </Badge>
              </td>
              <td class="px-4 py-3 text-xs font-mono text-foreground">{d.vehicle}</td>
              <td class="px-4 py-3 text-xs font-mono text-foreground">{d.trips.toLocaleString()}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 text-xs">
                  <Star size={10} class="text-amber-400 fill-amber-400" />
                  <span class="font-mono text-foreground">{d.rating}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                {#if canEdit}
                  <div class="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" class="size-7" onclick={() => openEdit(d)}
                      ><Edit2 class="size-3.5" /></Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="size-7 text-destructive hover:bg-destructive/10"
                      onclick={() => (deleteId = d.id)}><Trash2 class="size-3.5" /></Button>
                  </div>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">
      Showing {filtered.length} of {drivers.length} drivers
    </div>
  </div>

  <!-- Add / Edit Modal -->
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>{editId ? "Edit Driver" : "Add Driver"}</Dialog.Title>
      </Dialog.Header>
      <div class="grid gap-4 py-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5 col-span-2">
            <Label for="name" class="text-xs">Full Name *</Label>
            <Input id="name" bind:value={form.name} placeholder="James Mwangi" />
          </div>
          <div class="space-y-1.5">
            <Label for="status" class="text-xs">Status</Label>
            <NativeSelect id="status" bind:value={form.status} class="w-full">
              {#each ["active", "on_leave", "inactive"] as s (s)}<option value={s}>{s.replace("_", " ")}</option>{/each}
            </NativeSelect>
          </div>
          <div class="space-y-1.5">
            <Label for="email" class="text-xs">Email *</Label>
            <Input id="email" type="email" bind:value={form.email} placeholder="driver@transitops.co" />
          </div>
          <div class="space-y-1.5">
            <Label for="phone" class="text-xs">Phone</Label>
            <Input id="phone" bind:value={form.phone} placeholder="+254 7XX XXX XXX" />
          </div>
          <div class="space-y-1.5">
            <Label for="license" class="text-xs">License No.</Label>
            <Input id="license" bind:value={form.license} placeholder="DL-2024-0001" />
          </div>
          <div class="space-y-1.5">
            <Label for="licenseClass" class="text-xs">License Class</Label>
            <NativeSelect id="licenseClass" bind:value={form.licenseClass} class="w-full">
              {#each ["A", "B", "C", "C1", "C1E", "D", "D1"] as c (c)}<option>{c}</option>{/each}
            </NativeSelect>
          </div>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <Button class="flex-1" onclick={handleSave}
          ><Check class="mr-2 size-4" /> {editId ? "Save Changes" : "Add Driver"}</Button>
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
        <Dialog.Title>Remove Driver</Dialog.Title>
      </Dialog.Header>
      <div class="space-y-4">
        <div
          class="flex items-start gap-3 p-4 bg-destructive/10 text-destructive border rounded-xl border-destructive/20 text-sm">
          <AlertTriangle class="size-5 shrink-0 mt-0.5" />
          <p>This will permanently remove the driver record. Assign their vehicle to another driver first.</p>
        </div>
        <div class="flex gap-3">
          <Button variant="destructive" class="flex-1" onclick={() => deleteId && handleDelete(deleteId)}
            ><Trash2 class="mr-2 size-4" /> Confirm Remove</Button>
          <Button variant="secondary" onclick={() => (deleteId = null)}>Cancel</Button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
</div>
