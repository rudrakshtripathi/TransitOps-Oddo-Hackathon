<script lang="ts">
import { enhance } from "$app/forms"
import { Button } from "$lib/components/ui/button"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { Checkbox } from "$lib/components/ui/checkbox"
import * as Alert from "$lib/components/ui/alert"
import { NativeSelect } from "$lib/components/ui/native-select"
import { Eye, EyeOff, RefreshCw, AlertCircle } from "@lucide/svelte"
import { toast } from "svelte-sonner"
import { UserRole } from "$lib/constants"

import type { ActionData } from "../../../routes/auth/$types"

interface Props {
  form: ActionData
}

let { form }: Props = $props()

let showPass = $state(false)
let showConfirmPass = $state(false)
let loading = $state(false)

// Get array of roles from the UserRole enum
const roleOptions = Object.entries(UserRole).map(([key, value]) => ({
  value: value,
  label: value,
}))
</script>

<form
  method="POST"
  action="?/signup"
  use:enhance={() => {
    loading = true
    const toastId = toast.loading("Creating account...", {
      description: "Please wait while we set up your profile",
      position: "top-center",
    })

    return async ({ result, update }) => {
      loading = false
      if (result.type === "failure") {
        toast.error(String(result.data?.message) ?? "Failed to create account", {
          id: toastId,
        })
        await update()
      } else if (result.type === "error") {
        toast.error("An unexpected error occurred. Please try again.", {
          id: toastId,
        })
        await update()
      } else {
        toast.success("Account created successfully!", {
          id: toastId,
        })
        await update()
      }
    }
  }}
  class="space-y-4">
  <div class="flex flex-col gap-1.5">
    <Label for="signup-email" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Email address
    </Label>
    <Input
      id="signup-email"
      type="email"
      name="email"
      placeholder="you@transitops.co"
      disabled={loading}
      value={form?.email ?? ""}
      required
      class="w-full bg-input-background text-foreground text-sm focus:ring-ring/30 focus:border-primary" />
  </div>

  <div class="flex flex-col gap-1.5">
    <Label for="signup-role" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Select Role
    </Label>
    <NativeSelect
      id="signup-role"
      name="role"
      disabled={loading}
      required
      class="w-full bg-input-background border border-border">
      <option value="" disabled selected>Select a role...</option>
      {#each roleOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </NativeSelect>
  </div>

  <div class="flex flex-col gap-1.5">
    <Label for="signup-password" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Password
    </Label>
    <div class="relative">
      <Input
        id="signup-password"
        type={showPass ? "text" : "password"}
        name="password"
        placeholder="Create password"
        disabled={loading}
        required
        class="w-full pr-10 bg-input-background text-foreground text-sm focus:ring-ring/30 focus:border-primary" />
      <button
        type="button"
        onclick={() => (showPass = !showPass)}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground outline-none"
        disabled={loading}
        aria-label={showPass ? "Hide password" : "Show password"}>
        {#if showPass}
          <EyeOff class="size-4" />
        {:else}
          <Eye class="size-4" />
        {/if}
      </button>
    </div>
  </div>

  <div class="flex flex-col gap-1.5">
    <Label for="signup-confirm-password" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Confirm Password
    </Label>
    <div class="relative">
      <Input
        id="signup-confirm-password"
        type={showConfirmPass ? "text" : "password"}
        name="confirmPassword"
        placeholder="Confirm password"
        disabled={loading}
        required
        class="w-full pr-10 bg-input-background text-foreground text-sm focus:ring-ring/30 focus:border-primary" />
      <button
        type="button"
        onclick={() => (showConfirmPass = !showConfirmPass)}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground outline-none"
        disabled={loading}
        aria-label={showConfirmPass ? "Hide password" : "Show password"}>
        {#if showConfirmPass}
          <EyeOff class="size-4" />
        {:else}
          <Eye class="size-4" />
        {/if}
      </button>
    </div>
  </div>

  {#if form?.error}
    <Alert.Root variant="destructive" class="py-2 px-3 text-xs">
      <div class="flex items-center gap-2">
        <AlertCircle class="size-4 shrink-0" />
        <Alert.Description class="text-xs font-medium">
          {form?.error}
        </Alert.Description>
      </div>
    </Alert.Root>
  {/if}

  <div class="flex items-start gap-2 text-xs">
    <Checkbox id="terms" name="acceptTerms" disabled={loading} required class="mt-0.5" />
    <Label for="terms" class="text-xs text-muted-foreground cursor-pointer select-none leading-normal">
      I agree to the <a href="/" class="text-primary hover:underline font-medium">Terms of Service</a> and
      <a href="/" class="text-primary hover:underline font-medium">Privacy Policy</a>
    </Label>
  </div>

  <Button
    type="submit"
    disabled={loading}
    class="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 font-semibold rounded-xl text-sm mt-2">
    {#if loading}
      <span class="flex items-center justify-center gap-2">
        <RefreshCw class="size-4 animate-spin" /> Creating account...
      </span>
    {:else}
      Create account
    {/if}
  </Button>
</form>
