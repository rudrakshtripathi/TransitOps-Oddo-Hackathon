<script lang="ts">
import { Moon, Sun, User, Bell, Shield, Save } from "@lucide/svelte"
import { Button } from "$lib/components/ui/button"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { Checkbox } from "$lib/components/ui/checkbox"
import { toggleMode, mode } from "mode-watcher"
import { page } from "$app/state"

const isDark = $derived(mode.current === "dark")
const userEmail = $derived(page.data.user?.email || "user@transitops.co")
const userName = $derived(userEmail.split("@")[0].toUpperCase())
const userRole = $derived(page.data.user?.user_metadata?.role || "Admin")

let notifTrips = $state(true)
let notifMaintenance = $state(true)
let notifFuel = $state(false)
let saved = $state(false)

function handleSave() {
  saved = true
  setTimeout(() => (saved = false), 2000)
}
</script>

<div class="max-w-2xl space-y-6">
  <div class="mb-6">
    <h1 class="text-xl font-bold font-outfit text-foreground">Settings</h1>
    <p class="text-sm text-muted-foreground mt-0.5">Manage your account, preferences, and notifications</p>
  </div>

  <div class="space-y-4">
    <!-- Profile Section -->
    <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <User size={15} class="text-primary" />
        <h3 class="text-sm font-semibold font-outfit text-card-foreground">Profile</h3>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <Label>Full Name</Label>
          <Input value={userName} />
        </div>
        <div class="space-y-1.5">
          <Label>Email</Label>
          <Input value={userEmail} type="email" />
        </div>
        <div class="space-y-1.5">
          <Label>Role</Label>
          <Input value={userRole} disabled class="capitalize" />
        </div>
        <div class="space-y-1.5">
          <Label>Phone</Label>
          <Input value="+254 7XX XXX XXX" />
        </div>
      </div>
    </div>

    <!-- Appearance Section -->
    <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
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
          onclick={toggleMode}
          class="w-11 h-6 rounded-full transition-colors relative {isDark ? 'bg-primary' : 'bg-muted border'}">
          <span
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all flex items-center justify-center {isDark
              ? 'left-5'
              : 'left-0.5'}">
            {#if isDark}
              <Moon size={10} class="text-primary" />
            {:else}
              <Sun size={10} class="text-amber-500" />
            {/if}
          </span>
        </button>
      </div>
    </div>

    <!-- Notifications Section -->
    <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <Bell size={15} class="text-primary" />
        <h3 class="text-sm font-semibold font-outfit text-card-foreground">Notifications</h3>
      </div>
      <div class="space-y-4">
        <label class="flex items-center justify-between cursor-pointer select-none">
          <span class="text-sm text-foreground">Trip updates</span>
          <Checkbox bind:checked={notifTrips} />
        </label>
        <label class="flex items-center justify-between cursor-pointer select-none">
          <span class="text-sm text-foreground">Maintenance alerts</span>
          <Checkbox bind:checked={notifMaintenance} />
        </label>
        <label class="flex items-center justify-between cursor-pointer select-none">
          <span class="text-sm text-foreground">Fuel report summaries</span>
          <Checkbox bind:checked={notifFuel} />
        </label>
      </div>
    </div>

    <!-- Security Section -->
    <div class="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div class="flex items-center gap-2 mb-4">
        <Shield size={15} class="text-primary" />
        <h3 class="text-sm font-semibold font-outfit text-card-foreground">Security</h3>
      </div>
      <Button variant="secondary" size="sm">Change Password</Button>
    </div>

    <!-- Save Changes -->
    <div class="flex items-center gap-3">
      <Button variant="default" onclick={handleSave}><Save class="size-3.5 mr-1" /> Save Changes</Button>
      {#if saved}
        <span class="text-xs text-emerald-600 dark:text-emerald-400">Saved successfully</span>
      {/if}
    </div>
  </div>
</div>
