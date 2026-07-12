<script lang="ts">
import { Plus, Search, Download, Check, Fuel as FuelIcon, Droplets, TrendingUp, Gauge } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { NativeSelect } from "$lib/components/ui/native-select"
import * as Dialog from "$lib/components/ui/dialog"
import StatCard from "$lib/components/StatCard.svelte"
import { FUEL_DATA, VEHICLES_DATA, DRIVERS_DATA, fmtKES } from "$lib/data"

let { data } = $props()
let { session } = $derived(data)

let entries = $state(FUEL_DATA.map((f) => ({ ...f })))
let search = $state("")
let modalOpen = $state(false)

const emptyForm = {
  vehicle: VEHICLES_DATA[0].plate,
  driver: DRIVERS_DATA[0].name,
  liters: "0",
  costPerLiter: "185",
  station: "",
}
let form = $state({ ...emptyForm })

const filtered = $derived(
  entries.filter((f) => {
    const q = search.toLowerCase()
    return (
      !q ||
      f.vehicle.toLowerCase().includes(q) ||
      f.driver.toLowerCase().includes(q) ||
      f.station.toLowerCase().includes(q)
    )
  }),
)

const canEdit = $derived(!!session)
const totalSpend = $derived(entries.reduce((s, f) => s + f.total, 0))
const totalLiters = $derived(entries.reduce((s, f) => s + f.liters, 0))
const avgCost = $derived(totalLiters > 0 ? Math.round(totalSpend / totalLiters) : 0)

function openAdd() {
  form = { ...emptyForm }
  modalOpen = true
}

function handleSave() {
  if (!form.station || Number(form.liters) <= 0) return
  const liters = Number(form.liters)
  const costPerLiter = Number(form.costPerLiter)
  entries = [
    {
      id: `F${String(entries.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().slice(0, 10),
      vehicle: form.vehicle,
      driver: form.driver,
      liters,
      costPerLiter,
      total: Math.round(liters * costPerLiter),
      station: form.station,
    },
    ...entries,
  ]
  modalOpen = false
}
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 class="text-xl font-bold font-outfit text-foreground">Fuel & Expenses</h1>
      <p class="text-sm text-muted-foreground mt-0.5">Track fuel consumption and refuel costs across the fleet</p>
    </div>
    {#if canEdit}
      <Button variant="default" size="sm" onclick={openAdd}><Plus class="size-3.5 mr-1" /> Log Refuel</Button>
    {/if}
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard
      label="Total Fuel Spend"
      value={fmtKES(totalSpend)}
      sub={`${entries.length} refuel entries`}
      icon={FuelIcon}
      color="bg-amber-600" />
    <StatCard
      label="Total Volume"
      value={`${totalLiters.toLocaleString()} L`}
      sub="Across all vehicles"
      icon={Droplets}
      color="bg-blue-600" />
    <StatCard
      label="Avg Cost / Liter"
      value={`KES ${avgCost}`}
      sub="Fleet-wide average"
      icon={Gauge}
      color="bg-violet-600" />
  </div>

  <div class="flex flex-wrap items-center gap-3 mb-5">
    <div class="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
      <Search size={13} class="text-muted-foreground" />
      <input
        bind:value={search}
        placeholder="Search fuel entries…"
        class="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
    </div>
    <Button variant="ghost" size="sm"><Download class="size-3 mr-1" /> Export</Button>
  </div>

  <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/40">
            {#each ["Date", "Vehicle", "Driver", "Liters", "Rate", "Total", "Station"] as h (h)}
              <th
                class="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                >{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each filtered as f (f.id)}
            <tr class="hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3 text-xs font-mono text-muted-foreground">{f.date}</td>
              <td class="px-4 py-3 text-xs font-mono font-medium text-foreground">{f.vehicle}</td>
              <td class="px-4 py-3 text-xs text-foreground">{f.driver}</td>
              <td class="px-4 py-3 text-xs font-mono text-foreground">{f.liters} L</td>
              <td class="px-4 py-3 text-xs font-mono text-muted-foreground">KES {f.costPerLiter}</td>
              <td class="px-4 py-3 text-xs font-mono font-medium text-foreground">{fmtKES(f.total)}</td>
              <td class="px-4 py-3 text-xs text-muted-foreground">{f.station}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Log Refuel Modal -->
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Log Refuel</Dialog.Title>
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
            <Label for="driver" class="text-xs">Driver</Label>
            <NativeSelect id="driver" bind:value={form.driver} class="w-full">
              {#each DRIVERS_DATA as d (d.id)}<option value={d.name}>{d.name}</option>{/each}
            </NativeSelect>
          </div>
          <div class="space-y-1.5">
            <Label for="liters" class="text-xs">Liters *</Label>
            <Input id="liters" type="number" bind:value={form.liters} />
          </div>
          <div class="space-y-1.5">
            <Label for="costPerLiter" class="text-xs">Cost per Liter (KES)</Label>
            <Input id="costPerLiter" type="number" bind:value={form.costPerLiter} />
          </div>
        </div>
        <div class="space-y-1.5">
          <Label for="station" class="text-xs">Station *</Label>
          <Input id="station" bind:value={form.station} placeholder="Total Energies, Mombasa Rd" />
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <Button class="flex-1" onclick={handleSave}><Check class="mr-2 size-4" /> Log Entry</Button>
        <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
      </div>
    </Dialog.Content>
  </Dialog.Root>
</div>
