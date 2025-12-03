import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
   // Add ye lines:
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }
})
