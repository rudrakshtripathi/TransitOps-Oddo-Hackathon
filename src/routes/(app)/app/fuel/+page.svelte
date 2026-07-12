<script lang="ts">
import { Plus, Search, Download, Check, Fuel, Receipt } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import StatCard from "$lib/components/StatCard.svelte"
import { getExpenses, createExpense } from "$lib/api/fuel.remote"
import { getVehicles } from "$lib/api/vehicles.remote"
import { fmtKES } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

// Load expenses and vehicles reactively
let dataPromise = $state(Promise.all([getExpenses(), getVehicles()]))

let search = $state("")
let modalOpen = $state(false)

const emptyForm = { vehicleId: "", liters: "45", costPerLiter: "185", station: "Shell Westlands" }
let form = $state({ ...emptyForm })

const canEdit = $derived(!!session)

function openAdd(vehicles: any[]) {
  form = {
    vehicleId: vehicles[0]?.id || "",
    liters: "45",
    costPerLiter: "185",
    station: "Shell Westlands",
  }
  modalOpen = true
}

async function handleSave() {
  if (!form.vehicleId || !form.liters || !form.costPerLiter) return

  const totalCost = Number(form.liters) * Number(form.costPerLiter)
  const payload = {
    vehicleId: form.vehicleId,
    type: "Fuel" as any,
    cost: String(totalCost),
    liters: form.liters,
    date: new Date().toISOString(),
  }

  await createExpense(payload)
  dataPromise = Promise.all([getExpenses(), getVehicles()])
  modalOpen = false
}

function filterExpenses(list: any[]) {
  return list.filter((f) => {
    const q = search.toLowerCase()
    return !q || f.vehiclePlate.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)
  })
}
</script>

<div class="space-y-6">
  <svelte:boundary>
    {#await dataPromise}
      <div class="py-16 text-center text-sm text-muted-foreground bg-muted/10 border rounded-xl">
        Loading fuel expense records...
      </div>
    {:then [expensesRes, vehiclesRes]}
      {#if expensesRes.error || vehiclesRes.error}
        <div class="py-16 text-center text-sm text-destructive bg-destructive/10 border rounded-xl">
          Error loading data
        </div>
      {:else}
        {@const expensesList = expensesRes.data || []}
        {@const vehiclesList = vehiclesRes.data || []}
        {@const filtered = filterExpenses(expensesList)}

        {@const totalSpend = filtered.reduce((s, f) => s + Number(f.cost), 0)}
        {@const totalLiters = filtered.reduce((s, f) => s + Number(f.liters || 0), 0)}
        {@const avgCost = totalLiters > 0 ? Math.round(totalSpend / totalLiters) : 0}

        <div class="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 class="text-xl font-bold font-outfit text-foreground">Fuel Registry</h1>
            <p class="text-sm text-muted-foreground mt-0.5">Track fuel fill-ups and consumption metrics</p>
          </div>
          {#if canEdit}
            <Button variant="default" size="sm" onclick={() => openAdd(vehiclesList)}
              ><Plus class="size-3.5 mr-1" /> Log Fill-up</Button>
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
          <Button variant="ghost" size="sm"><Download class="size-3 mr-1" /> Export</Button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Spent" value={fmtKES(totalSpend)} icon={Receipt} trend={8.2} color="bg-primary" />
          <StatCard
            label="Total Fuel Consumed"
            value={`${totalLiters.toLocaleString()} L`}
            icon={Fuel}
            trend={12.4}
            color="bg-primary" />
          <StatCard
            label="Avg. Fuel Price / L"
            value={fmtKES(avgCost)}
            icon={Receipt}
            sub="Average cost per liter"
            color="bg-primary" />
        </div>

        <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  {#each ["Date", "Vehicle", "Type", "Liters", "Cost / L", "Total Cost"] as h (h)}
                    <th
                      class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                      >{h}</th>
                  {/each}
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                {#if filtered.length === 0}
                  <tr
                    ><td colspan="6" class="py-16 text-center text-sm text-muted-foreground">No fuel records found</td
                    ></tr>
                {:else}
                  {#each filtered as f (f.id)}
                    {@const costPerL = Number(f.liters) > 0 ? Math.round(Number(f.cost) / Number(f.liters)) : 0}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="px-4 py-3 text-xs font-mono text-muted-foreground"
                        >{new Date(f.date).toLocaleDateString()}</td>
                      <td class="px-4 py-3 font-mono text-xs font-semibold text-foreground">{f.vehiclePlate}</td>
                      <td class="px-4 py-3 text-xs text-muted-foreground">{f.type}</td>
                      <td class="px-4 py-3 text-xs font-mono text-foreground">{Number(f.liters).toFixed(1)} L</td>
                      <td class="px-4 py-3 text-xs font-mono text-muted-foreground">{fmtKES(costPerL)}</td>
                      <td class="px-4 py-3 text-xs font-mono text-foreground font-semibold"
                        >{fmtKES(Number(f.cost))}</td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">
            Showing {filtered.length} of {expensesList.length} fuel entries
          </div>
        </div>

        <!-- Add / Edit Modal -->
        <Dialog.Root bind:open={modalOpen}>
          <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
              <Dialog.Title>Log Fuel Fill-up</Dialog.Title>
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
                  <Label for="station" class="text-xs">Gas Station</Label>
                  <Input id="station" bind:value={form.station} placeholder="Shell Westlands" />
                </div>
                <div class="space-y-1.5">
                  <Label for="liters" class="text-xs">Liters Fuel *</Label>
                  <Input id="liters" type="number" bind:value={form.liters} />
                </div>
                <div class="space-y-1.5">
                  <Label for="costPerLiter" class="text-xs">Cost Per Liter (KES) *</Label>
                  <Input id="costPerLiter" type="number" bind:value={form.costPerLiter} />
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <Button class="flex-1" onclick={handleSave}><Check class="mr-2 size-4" /> Save Record</Button>
              <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
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
        <p>Failed to load fuel records: {error?.message || error}</p>
        <Button variant="outline" size="sm" onclick={reset}>Retry</Button>
      </div>
    {/snippet}
  </svelte:boundary>
</div>
