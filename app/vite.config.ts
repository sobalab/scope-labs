import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://sobalab.github.io/scope-labs/ in production, so built
// asset URLs need the /scope-labs/ prefix. Local dev/preview stay at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/scope-labs/' : '/',
  plugins: [react(), tailwindcss()],
}))
