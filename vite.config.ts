import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_DEPLOY_TARGET === 'github' ? '/kanji-app/' : '/',
  plugins: [react()],
})
