import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync } from "node:fs";

export default defineConfig({
  base: "",
  plugins: [
    react(),
    {
      name: "copy-exporter-core",
      closeBundle() {
        mkdirSync("dist/src", { recursive: true });
        copyFileSync("src/exporter-core.js", "dist/src/exporter-core.js");
      }
    }
  ],
  server: {
    port: 4173,
    strictPort: false,
    proxy: {
      "/api/search-index": {
        target: "https://www.anitabi.cn",
        changeOrigin: true,
        rewrite: () => "/d/g.json"
      },
      "/api/anitabi": {
        target: "https://api.anitabi.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anitabi/, "")
      }
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
