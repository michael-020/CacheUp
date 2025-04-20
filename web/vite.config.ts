import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,         // Allow access from outside the container (e.g., localhost)
    port: 5173,         // Must match docker-compose port
    strictPort: true,   // Exit if port is taken instead of trying next
    watch: {
      usePolling: true, // Helpful inside Docker sometimes
    },
  },
})
