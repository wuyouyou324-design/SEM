import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  // Legacy Pages serves the committed dist folder; Actions serves dist at /SEM/.
  base: process.env.VITE_BASE || (mode === "production" ? "/SEM/" : "/"),
  build: {
    rollupOptions: {
      input: "app.html",
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
}));
