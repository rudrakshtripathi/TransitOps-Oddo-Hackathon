<script lang="ts">
import { enhance } from "$app/forms"
import { Button } from "$lib/components/ui/button"
import { Input } from "$lib/components/ui/input"
import { Label } from "$lib/components/ui/label"
import { Checkbox } from "$lib/components/ui/checkbox"
import * as Alert from "$lib/components/ui/alert"
import { Eye, EyeOff, RefreshCw, AlertCircle } from "@lucide/svelte"
import { toast } from "svelte-sonner"

import type { ActionData } from "../../../routes/(unauthenticated)/auth/$types"

interface Props {
  form: ActionData
}

let { form }: Props = $props()

let showPass = $state(false)
let remember = $state(false)
let loading = $state(false)
</script>

<form
  method="POST"
  action="?/login"
  use:enhance={() => {
    loading = true
    const toastId = toast.loading("Signing in...", {
      description: "Please wait while we authenticate your credentials",
      position: "top-center",
    })

    return async ({ result, update }) => {
      loading = false
      if (result.type === "failure") {
        toast.error(String(result.data?.message) ?? "Invalid email or password", {
          id: toastId,
        })
        await update()
      } else if (result.type === "error") {
        toast.error("An unexpected error occurred. Please try again.", {
          id: toastId,
        })
        await update()
      } else {
        toast.success("Successfully logged in!", {
          id: toastId,
        })
        await update()
      }
    }
  }}
  class="space-y-4">
  <div class="flex flex-col gap-1.5">
    <Label for="login-email" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Email address
    </Label>
    <Input
      id="login-email"
      type="email"
      name="email"
      placeholder="you@transitops.co"
      value={form?.email ?? ""}
      disabled={loading}
      required
      class="w-full bg-input-background text-foreground text-sm focus:ring-ring/30 focus:border-primary" />
  </div>

  <div class="flex flex-col gap-1.5">
    <Label for="login-password" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Password
    </Label>
    <div class="relative">
      <Input
        id="login-password"
        type={showPass ? "text" : "password"}
        name="password"
        placeholder="Enter password"
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

  {#if form?.message}
    <Alert.Root variant="destructive" class="py-2 px-3 text-xs">
      <div class="flex items-center gap-2">
        <AlertCircle class="size-4 shrink-0" />
        <Alert.Description class="text-xs font-medium">
          {form?.message}
        </Alert.Description>
      </div>
    </Alert.Root>
  {/if}

  <div class="flex items-center justify-between text-xs">
    <label class="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
      <Checkbox id="remember" bind:checked={remember} name="remember" disabled={loading} />
      Remember me
    </label>
    <a href="/" class="text-primary hover:underline">Forgot password?</a>
  </div>

  <Button
    type="submit"
    disabled={loading}
    class="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 font-semibold rounded-xl text-sm">
    {#if loading}
      <span class="flex items-center justify-center gap-2">
        <RefreshCw class="size-4 animate-spin" /> Signing in...
      </span>
    {:else}
      Sign in
    {/if}
  </Button>
</form>
