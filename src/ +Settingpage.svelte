<script lang="ts">
import { Moon, Sun, User, Bell, Shield, Save } from "lucide-svelte"
import SectionHeader from "$lib/components/SectionHeader.svelte"
import Btn from "$lib/components/Btn.svelte"
import FormField from "$lib/components/FormField.svelte"
import Input from "$lib/components/Input.svelte"
import { appState } from "$lib/state/app-state.svelte"

const userName = $derived(
  appState.role === "admin" ? "Alex Kariuki" : appState.role === "manager" ? "Beatrice Auma" : "James Mwangi",
)
const userEmail = $derived(`${userName.split(" ")[0].toLowerCase()}@transitops.co`)

let notifTrips = $state(true)
let notifMaintenance = $state(true)
let notifFuel = $state(false)
let saved = $state(false)

function handleSave() {
  saved = true
  setTimeout(() => (saved = false), 2000)
}
</script>

<div class="max-w-2xl">
  <SectionHeader title="Settings" description="Manage your account, preferences, and notifications" />

  <div class="space-y-4">
    <div class="bg-card border border-border rounded-xl p-5">
      <div class="flex items-center gap-2 mb-4">
        <User size={15} class="text-primary" />
        <h3 class="text-sm font-semibold font-outfit text-card-foreground">Profile</h3>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField label="Full Name"><Input value={userName} /></FormField>
        <FormField label="Email"><Input value={userEmail} type="email" /></FormField>
        <FormField label="Role"><Input value={appState.role} /></FormField>
        <FormField label="Phone"><Input value="+254 7XX XXX XXX" /></FormField>
      </div>
    </div>

    <div class="bg-card border border-border rounded-xl p-5">
      <div class="flex items-center gap-2 mb-4">
        <Sun size={15} class="text-primary" />
        <h3 class="text-sm font-semibold font-outfit text-card-foreground">Appearance</h3>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-foreground">Dark mode</div>
          <div class="text-xs text-muted-foreground">Switch between light and dark theme</div>
        </div>
        <button
          onclick={() => appState.toggleTheme()}
          class="w-11 h-6 rounded-full transition-colors relative {appState.isDark
            ? 'bg-primary'
            : 'bg-switch-background'}">
          <span
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform flex items-center justify-center {appState.isDark
              ? 'translate-x-5'
              : 'translate-x-0.5'}">
            {#if appState.isDark}
              <Moon size={10} class="text-primary" />
            {:else}
              <Sun size={10} class="text-amber-500" />
            {/if}
          </span>
        </button>
      </div>
    </div>

    <div class="bg-card border border-border rounded-xl p-5">
      <div class="flex items-center gap-2 mb-4">
        <Bell size={15} class="text-primary" />
        <h3 class="text-sm font-semibold font-outfit text-card-foreground">Notifications</h3>
      </div>
      <div class="space-y-3">
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm text-foreground">Trip updates</span>
          <input type="checkbox" bind:checked={notifTrips} class="rounded border-border" />
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm text-foreground">Maintenance alerts</span>
          <input type="checkbox" bind:checked={notifMaintenance} class="rounded border-border" />
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm text-foreground">Fuel report summaries</span>
          <input type="checkbox" bind:checked={notifFuel} class="rounded border-border" />
        </label>
      </div>
    </div>

    <div class="bg-card border border-border rounded-xl p-5">
      <div class="flex items-center gap-2 mb-4">
        <Shield size={15} class="text-primary" />
        <h3 class="text-sm font-semibold font-outfit text-card-foreground">Security</h3>
      </div>
      <Btn variant="secondary" size="sm">Change Password</Btn>
    </div>

    <div class="flex items-center gap-3">
      <Btn variant="primary" onclick={handleSave}><Save size={13} /> Save Changes</Btn>
      {#if saved}
        <span class="text-xs text-emerald-600 dark:text-emerald-400">Saved successfully</span>
      {/if}
    </div>
  </div>
</div>
