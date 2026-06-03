import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";

export default defineConfig({
  base: "",
  plugins: [
    react(),
    {
      name: "anitabi-exporter-assets",
      configureServer(server) {
        server.middlewares.use("/api/search-index", (_request, response) => {
          response.statusCode = 200;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.setHeader("cache-control", "no-store");
          response.end(readFileSync("public/data/search-index.json"));
        });
      },
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
