import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * GitHub Pages serves 404.html for unknown paths. Shipping a copy of index.html
 * keeps client-side routing working without any server configuration.
 */
function spaFallback(): Plugin {
  return {
    name: 'reqstudio-spa-fallback',
    apply: 'build',
    closeBundle() {
      const index = resolve(import.meta.dirname, 'dist/index.html')
      if (existsSync(index)) copyFileSync(index, resolve(import.meta.dirname, 'dist/404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Set VITE_BASE=/<repo-name>/ when deploying to GitHub Pages project sites.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
