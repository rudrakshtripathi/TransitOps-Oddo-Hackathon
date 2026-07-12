<script lang="ts">
import { Truck, Navigation, BarChart3, Shield } from "@lucide/svelte"
import { cn } from "$lib/utils"
import { fly } from "svelte/transition"
import LoginForm from "$lib/components/auth/LoginForm.svelte"
import SignupForm from "$lib/components/auth/SignupForm.svelte"

let { form }: { form?: any } = $props()

let activeTab = $state<"login" | "signup">("login")

const features = [
  { icon: Truck, text: "Real-time fleet visibility" },
  { icon: Navigation, text: "Live trip tracking & scheduling" },
  { icon: BarChart3, text: "Advanced analytics & reporting" },
  { icon: Shield, text: "Role-based access control" },
]
</script>

<div class="min-h-screen bg-background flex">
  <!-- Left panel -->
  <div class="flex-1 hidden lg:flex flex-col bg-[#0F172A] relative overflow-hidden">
    <div class="absolute inset-0 bg-[linear-gradient(135deg,#1E3A5F_0%,#0F172A_50%,#162032_100%)]"></div>
    <div
      class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2">
    </div>
    <div
      class="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-800/20 blur-3xl translate-y-1/2 -translate-x-1/2">
    </div>

    <div class="relative z-10 flex flex-col h-full px-12 py-10">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          <Truck size={18} class="text-white" />
        </div>
        <span class="text-white font-bold text-lg font-outfit tracking-tight">TransitOps</span>
      </div>

      <div class="flex-1 flex flex-col justify-center">
        <div class="max-w-sm">
          <div class="text-xs font-dm-mono text-blue-400/70 uppercase tracking-[0.2em] mb-4">
            Fleet Management Platform
          </div>
          <h2 class="text-3xl font-bold text-white font-outfit leading-tight mb-6">
            One platform.<br />Every vehicle,<br />every driver.
          </h2>
          <div class="space-y-3">
            {#each features as { icon: Icon, text } (text)}
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} class="text-blue-300" />
                </div>
                <span class="text-sm text-slate-300">{text}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="text-xs text-slate-500 font-dm-mono">© 2026 TransitOps Ltd. — v2.4.1</div>
    </div>
  </div>

  <!-- Right panel -->
  <div class="flex-1 flex items-center justify-center px-6 py-12 bg-background">
    <div class="w-full max-w-sm" in:fly={{ y: 16, duration: 200 }}>
      <div class="flex items-center gap-2 mb-8 lg:hidden">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Truck size={15} class="text-white" />
        </div>
        <span class="font-bold font-outfit text-foreground">TransitOps</span>
      </div>

      <div class="mb-8">
        {#if activeTab === "login"}
          <h1 class="text-2xl font-bold font-outfit text-foreground">Sign in</h1>
          <p class="text-sm text-muted-foreground mt-1">Access your fleet management console</p>
        {:else}
          <h1 class="text-2xl font-bold font-outfit text-foreground">Create account</h1>
          <p class="text-sm text-muted-foreground mt-1">Get started with TransitOps fleet management</p>
        {/if}
      </div>

      <!-- Tab buttons -->
      <div class="flex rounded-xl border border-border bg-card p-1 mb-6 gap-1">
        <button
          onclick={() => (activeTab = "login")}
          class={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all",
            activeTab === "login"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}>
          Sign In
        </button>
        <button
          onclick={() => (activeTab = "signup")}
          class={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all",
            activeTab === "signup"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}>
          Sign Up
        </button>
      </div>

      {#if activeTab === "login"}
        <LoginForm {form} />
      {:else}
        <SignupForm {form} />
      {/if}
    </div>
  </div>
</div>
