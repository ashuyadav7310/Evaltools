import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/convai/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3003,
    strictPort: true,
    watch: {
      ignored: ["**/public/images/**"],
    },
    proxy: {
      // Forward /api calls to the Python FastAPI backend during development
      "/api/convai": {
        target: "http://localhost:8003",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/convai/, "/api"),
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
