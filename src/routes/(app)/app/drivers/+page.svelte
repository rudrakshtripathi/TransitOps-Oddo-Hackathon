<script lang="ts">
import { Plus, Search, Download, Edit2, Trash2, AlertTriangle, Check, User, Star } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import { getDrivers, createDriver, updateDriver, deleteDriver } from "$lib/api/drivers.remote"
import { BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

// Load data reactively via Svelte 5 promise state
let driversPromise = $state(getDrivers())

let search = $state("")
let filterStatus = $state("all")
let modalOpen = $state(false)
let editId = $state<string | null>(null)
let deleteId = $state<string | null>(null)

const emptyForm = { name: "", email: "", phone: "", license: "", licenseClass: "C", status: "active" }
let form = $state({ ...emptyForm })

const canEdit = $derived(!!session)

function openAdd() {
  editId = null
  form = { ...emptyForm }
  modalOpen = true
}

function openEdit(d: any) {
  editId = d.id
  form = {
    name: d.name,
    email: d.email || `${d.name.split(" ")[0].toLowerCase()}@transitops.co`,
    phone: d.contactNumber,
    license: d.licenseNumber,
    licenseClass: d.licenseCategory,
    status: d.status,
  }
  modalOpen = true
}

async function handleSave() {
  if (!form.name || !form.phone || !form.license) return

  const payload = {
    name: form.name,
    licenseNumber: form.license,
    licenseCategory: form.licenseClass,
    licenseExpiryDate: new Date("2029-12-31").toISOString(),
    contactNumber: form.phone,
    safetyScore: 100,
    status: form.status as any,
  }

  if (editId) {
    await updateDriver({ id: editId, driver: payload })
  } else {
    await createDriver(payload)
  }

  driversPromise = getDrivers()
  modalOpen = false
}

async function handleDelete(id: string) {
  await deleteDriver(id)
  driversPromise = getDrivers()
  deleteId = null
}

function filterDrivers(list: any[]) {
  return list.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.licenseNumber.toLowerCase().includes(q) ||
      d.contactNumber.toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || d.status === filterStatus
    return matchSearch && matchStatus
  })
}
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 class="text-xl font-bold font-outfit text-foreground">Driver Registry</h1>
      <p class="text-sm text-muted-foreground mt-0.5">Manage registered drivers</p>
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

  <svelte:boundary>
    {#await driversPromise}
      <div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
        Loading drivers from database...
      </div>
    {:then res}
      {#if res.error}
        <div class="py-16 text-center text-sm text-destructive bg-destructive/10 border rounded-xl">
          Error loading drivers: {res.error}
        </div>
      {:else if res.data}
        {@const filtered = filterDrivers(res.data)}
        <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  {#each ["Driver", "License", "Class", "Contact", "Status", "Rating", ""] as h (h)}
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
                      >No drivers match your filters</td
                    ></tr>
                {:else}
                  {#each filtered as d (d.id)}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2.5">
                          <div
                            class="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <User size={12} class="text-primary" />
                          </div>
                          <div>
                            <div class="text-xs font-medium text-foreground">{d.name}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-xs font-mono text-muted-foreground">{d.licenseNumber}</td>
                      <td class="px-4 py-3 text-xs font-mono font-medium text-foreground">{d.licenseCategory}</td>
                      <td class="px-4 py-3">
                        <div class="text-xs text-foreground">{d.contactNumber}</div>
                      </td>
                      <td class="px-4 py-3">
                        <Badge variant="outline" class={BADGE_STYLES[d.status as BadgeVariant]}>
                          {BADGE_LABELS[d.status as BadgeVariant]}
                        </Badge>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-1 text-xs">
                          <Star size={10} class="text-amber-400 fill-amber-400" />
                          <span class="font-mono text-foreground">{((d.safetyScore || 100) / 20).toFixed(1)}</span>
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
                {/if}
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">
            Showing {filtered.length} of {res.data.length} drivers
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
        <p>Failed to load drivers: {error?.message || error}</p>
        <Button variant="outline" size="sm" onclick={reset}>Retry</Button>
      </div>
    {/snippet}
  </svelte:boundary>

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
            <Label for="phone" class="text-xs">Phone *</Label>
            <Input id="phone" bind:value={form.phone} placeholder="+254 7XX XXX XXX" />
          </div>
          <div class="space-y-1.5">
            <Label for="license" class="text-xs">License No. *</Label>
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
