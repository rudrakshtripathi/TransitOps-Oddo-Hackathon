<script lang="ts">
	import logoUrl from '$lib/assets/logo.jpeg';
	import { ArrowRight, Truck, ShieldCheck, Wrench } from '@lucide/svelte';
</script>

<svelte:head>
	<title>TransitOps — Next Gen Fleet Management</title>
</svelte:head>

<div class="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col items-center font-sans selection:bg-emerald-500/30">
	<!-- Background Image with Overlay -->
	<div 
		class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 animate-pulse-slow"
		style="background-image: url({logoUrl}); filter: blur(12px) brightness(0.5);"
	></div>
	
	<!-- Gradient Overlay -->
	<div class="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/90 to-black"></div>

	<!-- Content -->
	<div class="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
		
		<!-- Hero Section -->
		<div class="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up mt-12">
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 hover:bg-white/10 transition-colors">
				<span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
				<span class="text-sm font-medium tracking-wide text-emerald-50">TransitOps v1.0 is live</span>
			</div>
			
			<h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 pb-2">
				Next-Generation Fleet <br/> Management
			</h1>
			
			<p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
				Supercharge your transit operations with real-time analytics, automated maintenance tracking, and intelligent driver management.
			</p>
			
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
				<a 
					href="/auth" 
					class="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
				>
					<span class="relative z-10 flex items-center gap-2">
						Get Started <ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
					</span>
					<div class="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
				</a>
				
				<a 
					href="#features" 
					class="inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-full backdrop-blur-sm transition-all hover:border-white/20"
				>
					Explore Features
				</a>
			</div>
		</div>

		<!-- Logo Display (Actual Logo in a glass card) -->
		<div class="mt-20 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/5 shadow-[0_0_80px_rgba(255,255,255,0.05)] animate-float backdrop-blur-md bg-black/40 relative group">
			<div class="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
			<img src={logoUrl} alt="TransitOps Logo" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
		</div>

		<!-- Features Section -->
		<div id="features" class="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl w-full pb-20">
			{#each [
				{ title: 'Fleet Tracking', desc: 'Monitor active vehicles, utilization rates, and operational efficiency.', icon: Truck, color: 'text-blue-400' },
				{ title: 'Predictive Maintenance', desc: 'Log expenses, parts, and maintenance schedules automatically.', icon: Wrench, color: 'text-amber-400' },
				{ title: 'Safety & Compliance', desc: 'Track driver licenses, safety scores, and regulatory compliance.', icon: ShieldCheck, color: 'text-emerald-400' }
			] as feature}
				{@const Icon = feature.icon}
				<div class="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-15px_rgba(255,255,255,0.1)]">
					<div class="w-14 h-14 rounded-2xl bg-black/50 flex items-center justify-center mb-6 border border-white/5 group-hover:border-white/10 transition-colors group-hover:scale-110 duration-300">
						<Icon size={26} class={feature.color} />
					</div>
					<h3 class="text-xl font-bold mb-3 text-white">{feature.title}</h3>
					<p class="text-gray-400 leading-relaxed">{feature.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-20px); }
	}
	@keyframes fade-in-up {
		0% { opacity: 0; transform: translateY(40px); }
		100% { opacity: 1; transform: translateY(0); }
	}
	@keyframes pulse-slow {
		0%, 100% { opacity: 0.15; }
		50% { opacity: 0.3; }
	}
	.animate-float {
		animation: float 8s ease-in-out infinite;
	}
	.animate-fade-in-up {
		animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.animate-pulse-slow {
		animation: pulse-slow 8s ease-in-out infinite;
	}
</style>
