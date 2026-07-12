import tailwindcss from "@tailwindcss/vite"
import { sveltekit } from "@sveltejs/kit/vite"
import adapter from "@sveltejs/adapter-static"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
        experimental: { async: true },
      },
      adapter: adapter({
        runtime: "experimental_bun1.x",
      }),
      experimental: { remoteFunctions: true, handleRenderingErrors: true },
      typescript: {
        config: (config) => {
          config.include.push("../drizzle.config.ts")
        },
      },
    }),
  ],
})
