import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    watch: {
      ignored: [
        "**/Tools/**/node_modules/**",
        "**/Tools/**/.next/**",
        "**/Tools/**/dist/**",
        "**/Tools/**/venv/**",
        "**/Tools/**/.venv/**",
        "**/Tools/**/__pycache__/**",
        "**/Tools/EvalAI/jobs/**",
        "**/Tools/EvalAI/input_data/**",
        "**/Tools/EvalAI/output/**",
      ],
    },
    proxy: {
      "/evalai": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        ws: true,
      },
      "/comcoachai": {
        target: "http://127.0.0.1:3002",
        changeOrigin: true,
        ws: true,
      },
      "/api/comcoachai": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (requestPath) =>
          requestPath.replace(/^\/api\/comcoachai/, "/api"),
      },
      "/convai": {
        target: "http://127.0.0.1:3003",
        changeOrigin: true,
        ws: true,
      },
      "/api/convai": {
        target: "http://127.0.0.1:8003",
        changeOrigin: true,
        rewrite: (requestPath) =>
          requestPath.replace(/^\/api\/convai/, "/api"),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        home: resolve(import.meta.dirname, "Home page.html"),
      },
    },
  },
});
