<script lang="ts">
import { Plus, Search, Download, Check, AlertTriangle, Hammer, Wrench } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Badge } from "$lib/components/ui/badge"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import { getMaintenanceLogs, createMaintenanceLog, updateMaintenanceLog } from "$lib/api/maintenance.remote"
import { getVehicles } from "$lib/api/vehicles.remote"
import { fmtKES, BADGE_STYLES, BADGE_LABELS, type BadgeVariant } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

// Load logs and vehicles reactively
let dataPromise = $state(Promise.all([getMaintenanceLogs(), getVehicles()]))

let search = $state("")
let filterStatus = $state("all")
let modalOpen = $state(false)
let completeId = $state<string | null>(null)

const emptyForm = {
  vehicleId: "",
  type: "Routine Inspection",
  scheduled: "",
  cost: "15000",
  technician: "AutoWorks Ltd",
  priority: "normal",
}
let form = $state({ ...emptyForm })

const canEdit = $derived(!!session)

function openAdd(vehicles: any[]) {
  form = {
    vehicleId: vehicles[0]?.id || "",
    type: "Routine Inspection",
    scheduled: new Date().toISOString().split("T")[0],
    cost: "15000",
    technician: "AutoWorks Ltd",
    priority: "normal",
  }
  modalOpen = true
}

async function handleSave() {
  if (!form.vehicleId || !form.type || !form.scheduled) return

  const payload = {
    vehicleId: form.vehicleId,
    description: `${form.type} (${form.technician}) [Priority: ${form.priority}]`,
    status: "upcoming" as any,
    cost: form.cost,
    dateLogged: new Date(form.scheduled).toISOString(),
  }

  await createMaintenanceLog(payload)
  dataPromise = Promise.all([getMaintenanceLogs(), getVehicles()])
  modalOpen = false
}

async function handleComplete(id: string) {
  await updateMaintenanceLog({ id, log: { status: "completed" as any } })
  dataPromise = Promise.all([getMaintenanceLogs(), getVehicles()])
  completeId = null
}

function filterLogs(list: any[]) {
  return list.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.vehiclePlate.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || m.status === filterStatus
    return matchSearch && matchStatus
  })
}
</script>

<div class="space-y-6">
  <svelte:boundary>
    {#await dataPromise}
      <div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
        Loading maintenance schedules...
      </div>
    {:then [logsRes, vehiclesRes]}
      {#if logsRes.error || vehiclesRes.error}
        <div class="py-16 text-center text-sm text-destructive bg-destructive/10 border rounded-xl">
          Error loading data
        </div>
      {:else}
        {@const logsList = logsRes.data || []}
        {@const vehiclesList = vehiclesRes.data || []}
        {@const filtered = filterLogs(logsList)}
        {@const totalCost = filtered.reduce((s, m) => s + Number(m.cost || 0), 0)}

        <div class="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 class="text-xl font-bold font-outfit text-foreground">Maintenance Schedule</h1>
            <p class="text-sm text-muted-foreground mt-0.5">Manage schedules, logs, and service records</p>
          </div>
          {#if canEdit}
            <Button variant="default" size="sm" onclick={() => openAdd(vehiclesList)}
              ><Plus class="size-3.5 mr-1" /> Log Service</Button>
          {/if}
        </div>

        <div class="flex flex-wrap items-center gap-3 mb-5">
          <div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
            <Search size={13} class="text-muted-foreground" />
            <input
              bind:value={search}
              placeholder="Search vehicle or type…"
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

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Wrench size={18} />
            </div>
            <div>
              <div class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Total cost logged
              </div>
              <div class="text-lg font-bold font-outfit text-foreground mt-0.5">{fmtKES(totalCost)}</div>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  {#each ["ID", "Vehicle", "Description", "Scheduled Date", "Cost", "Status", ""] as h (h)}
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
                      >No maintenance records found</td
                    ></tr>
                {:else}
                  {#each filtered as m (m.id)}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{m.id.slice(0, 8)}</td>
                      <td class="px-4 py-3 font-mono text-xs font-semibold text-foreground">{m.vehiclePlate}</td>
                      <td class="px-4 py-3 text-xs text-foreground font-medium">{m.description}</td>
                      <td class="px-4 py-3 text-xs font-mono text-muted-foreground"
                        >{new Date(m.dateLogged).toLocaleDateString()}</td>
                      <td class="px-4 py-3 text-xs font-mono text-foreground font-semibold"
                        >{fmtKES(Number(m.cost || 0))}</td>
                      <td class="px-4 py-3">
                        <Badge variant="outline" class={BADGE_STYLES[m.status as BadgeVariant]}>
                          {BADGE_LABELS[m.status as BadgeVariant]}
                        </Badge>
                      </td>
                      <td class="px-4 py-3">
                        {#if canEdit && m.status !== "completed"}
                          <div class="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              class="h-7 text-xs text-primary hover:bg-primary/10"
                              onclick={() => (completeId = m.id)}><Check class="size-3.5 mr-1" /> Mark Complete</Button>
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
            Showing {filtered.length} of {logsList.length} logs
          </div>
        </div>

        <!-- Add / Edit Modal -->
        <Dialog.Root bind:open={modalOpen}>
          <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
              <Dialog.Title>Log Maintenance Service</Dialog.Title>
            </Dialog.Header>
            <div class="grid gap-4 py-2">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <Label for="vehicle" class="text-xs">Vehicle *</Label>
                  <NativeSelect id="vehicle" bind:value={form.vehicleId} class="w-full bg-card">
                    {#each vehiclesList as v (v.id)}
                      <option value={v.id}>{v.registrationNumber} ({v.name})</option>
                    {/each}
                  </NativeSelect>
                </div>
                <div class="space-y-1.5">
                  <Label for="type" class="text-xs">Service Type *</Label>
                  <NativeSelect id="type" bind:value={form.type} class="w-full bg-card">
                    {#each ["Routine Inspection", "Brake Replacement", "Oil Change", "Engine Tuning", "Tire Rotation", "Suspension Fix"] as t (t)}
                      <option value={t}>{t}</option>
                    {/each}
                  </NativeSelect>
                </div>
                <div class="space-y-1.5">
                  <Label for="scheduled" class="text-xs">Scheduled Date *</Label>
                  <Input id="scheduled" type="date" bind:value={form.scheduled} />
                </div>
                <div class="space-y-1.5">
                  <Label for="cost" class="text-xs">Cost (KES)</Label>
                  <Input id="cost" type="number" bind:value={form.cost} />
                </div>
                <div class="space-y-1.5">
                  <Label for="technician" class="text-xs">Technician / Garage</Label>
                  <Input id="technician" bind:value={form.technician} placeholder="AutoWorks Ltd" />
                </div>
                <div class="space-y-1.5">
                  <Label for="priority" class="text-xs">Priority</Label>
                  <NativeSelect id="priority" bind:value={form.priority} class="w-full bg-card">
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </NativeSelect>
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <Button class="flex-1" onclick={handleSave}><Check class="mr-2 size-4" /> Log Service</Button>
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
              <Dialog.Title>Complete Service</Dialog.Title>
            </Dialog.Header>
            <div class="space-y-4">
              <div
                class="flex items-start gap-3 p-4 bg-primary/10 text-primary border rounded-xl border-primary/20 text-sm">
                <Hammer class="size-5 shrink-0 mt-0.5" />
                <p>
                  Are you sure you want to mark this maintenance record as Completed? This registers the service cost
                  under vehicle stats.
                </p>
              </div>
              <div class="flex gap-3">
                <Button class="flex-1" onclick={() => completeId && handleComplete(completeId)}
                  ><Check class="mr-2 size-4" /> Confirm Complete</Button>
                <Button variant="secondary" onclick={() => (completeId = null)}>Cancel</Button>
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
        <p>Failed to load maintenance records: {error?.message || error}</p>
        <Button variant="outline" size="sm" onclick={reset}>Retry</Button>
      </div>
    {/snippet}
  </svelte:boundary>
</div>
