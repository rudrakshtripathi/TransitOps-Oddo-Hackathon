<script lang="ts">
import { Plus, Search, Download, Check, Wrench, AlertTriangle } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import { MAINTENANCE_DATA, VEHICLES_DATA, fmtKES, BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

let records = $state(MAINTENANCE_DATA.map((m) => ({ ...m })))
let search = $state("")
let filterStatus = $state("all")
let modalOpen = $state(false)
let completeId = $state<string | null>(null)

const emptyForm = {
  vehicle: VEHICLES_DATA[0].plate,
  type: "",
  scheduled: "",
  cost: "0",
  technician: "",
  priority: "normal",
}
let form = $state({ ...emptyForm })

const filtered = $derived(
  records.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.vehicle.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || m.status === filterStatus
    return matchSearch && matchStatus
  }),
)

const canEdit = $derived(!!session)
const totalCost = $derived(filtered.reduce((s, m) => s + m.cost, 0))

function openAdd() {
  form = { ...emptyForm }
  modalOpen = true
}

function handleSave() {
  if (!form.type || !form.scheduled) return
  records = [
    {
      id: `M${String(records.length + 1).padStart(3, "0")}`,
      vehicle: form.vehicle,
      type: form.type,
      scheduled: form.scheduled,
      status: "upcoming",
      cost: Number(form.cost),
      technician: form.technician,
      priority: form.priority,
    },
    ...records,
  ]
  modalOpen = false
}

function handleComplete(id: string) {
  records = records.map((m) => (m.id === id ? { ...m, status: "completed" } : m))
  completeId = null
}
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 class="text-xl font-bold font-outfit text-foreground">Maintenance</h1>
      <p class="text-sm text-muted-foreground mt-0.5">
        {filtered.length} records · {fmtKES(totalCost)} total cost (filtered)
      </p>
    </div>
    {#if canEdit}
      <Button variant="default" size="sm" onclick={openAdd}><Plus class="size-3.5 mr-1" /> Schedule Service</Button>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-3 mb-5">
    <div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
      <Search size={13} class="text-muted-foreground" />
      <input
        bind:value={search}
        placeholder="Search maintenance…"
        class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
    </div>
    <NativeSelect bind:value={filterStatus} class="w-36 bg-card">
      <option value="all">All Status</option>
      {#each ["upcoming", "in_progress", "completed", "overdue"] as s (s)}<option value={s}
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
            {#each ["ID", "Vehicle", "Service", "Scheduled", "Priority", "Status", "Cost", "Technician", ""] as h (h)}
              <th
                class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                >{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each filtered as m (m.id)}
            <tr class={m.status === "overdue" ? "bg-red-50/50 dark:bg-red-900/5" : ""}>
              <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{m.id}</td>
              <td class="px-4 py-3 font-mono text-xs font-medium text-foreground">{m.vehicle}</td>
              <td class="px-4 py-3 text-xs text-foreground">
                <div class="flex items-center gap-1.5">
                  <Wrench size={11} class="text-muted-foreground" />
                  {m.type}
                </div>
              </td>
              <td class="px-4 py-3 text-xs font-mono text-muted-foreground">{m.scheduled}</td>
              <td class="px-4 py-3 font-medium">
                <Badge variant="outline" class={BADGE_STYLES[m.priority as BadgeVariant]}>
                  {BADGE_LABELS[m.priority as BadgeVariant]}
                </Badge>
              </td>
              <td class="px-4 py-3">
                <Badge variant="outline" class={BADGE_STYLES[m.status as BadgeVariant]}>
                  {BADGE_LABELS[m.status as BadgeVariant]}
                </Badge>
              </td>
              <td class="px-4 py-3 text-xs font-mono text-foreground">{fmtKES(m.cost)}</td>
              <td class="px-4 py-3 text-xs text-muted-foreground">{m.technician}</td>
              <td class="px-4 py-3 text-right">
                {#if canEdit && m.status !== "completed"}
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-7 text-emerald-600 hover:bg-emerald-500/10"
                    onclick={() => (completeId = m.id)}
                    title="Mark complete">
                    <Check class="size-3.5" />
                  </Button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add / Edit Modal -->
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Schedule Service</Dialog.Title>
      </Dialog.Header>
      <div class="grid gap-4 py-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label for="vehicle" class="text-xs">Vehicle</Label>
            <NativeSelect id="vehicle" bind:value={form.vehicle} class="w-full">
              {#each VEHICLES_DATA as v (v.id)}<option value={v.plate}>{v.plate}</option>{/each}
            </NativeSelect>
          </div>
          <div class="space-y-1.5">
            <Label for="type" class="text-xs">Service Type *</Label>
            <Input id="type" bind:value={form.type} placeholder="Oil Change" />
          </div>
          <div class="space-y-1.5">
            <Label for="scheduled" class="text-xs">Scheduled Date *</Label>
            <Input id="scheduled" bind:value={form.scheduled} placeholder="2026-02-01" />
          </div>
          <div class="space-y-1.5">
            <Label for="cost" class="text-xs">Estimated Cost (KES)</Label>
            <Input id="cost" type="number" bind:value={form.cost} />
          </div>
          <div class="space-y-1.5">
            <Label for="technician" class="text-xs">Technician / Garage</Label>
            <Input id="technician" bind:value={form.technician} placeholder="Auto Care Garage" />
          </div>
          <div class="space-y-1.5">
            <Label for="priority" class="text-xs">Priority</Label>
            <NativeSelect id="priority" bind:value={form.priority} class="w-full">
              {#each ["low", "normal", "high", "critical"] as p (p)}<option value={p}>{p}</option>{/each}
            </NativeSelect>
          </div>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <Button class="flex-1" onclick={handleSave}><Check class="mr-2 size-4" /> Schedule</Button>
        <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
      </div>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Complete Modal -->
  <Dialog.Root
    open={!!completeId}
    onOpenChange={(o) => {
      if (!o) completeId = null
    }}>
    <Dialog.Content class="sm:max-w-[400px]">
      <Dialog.Header>
        <Dialog.Title>Mark Service Complete</Dialog.Title>
      </Dialog.Header>
      <div class="space-y-4">
        <div
          class="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
          <AlertTriangle class="size-5 shrink-0 mt-0.5 text-emerald-600" />
          <p class="text-sm text-emerald-700 dark:text-emerald-300">
            Confirm this maintenance record is finished. The vehicle will be marked available again.
          </p>
        </div>
        <div class="flex gap-3">
          <Button variant="default" class="flex-1" onclick={() => completeId && handleComplete(completeId)}
            ><Check class="mr-2 size-4" /> Confirm Complete</Button>
          <Button variant="secondary" onclick={() => (completeId = null)}>Cancel</Button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
</div>
