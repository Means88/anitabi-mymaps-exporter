import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const extensionEntries = new Set(["background", "content"]);

export default defineConfig({
  base: "",
  plugins: [
    react(),
    {
      name: "anitabi-exporter-build-fallback-data",
      apply: "build",
      buildStart() {
        const result = spawnSync(process.execPath, [
          "scripts/build-geo2025-fallback.ts",
          "data/geo2025.json",
          "data/users.csv",
          "public/data/geo2025",
          "public/data/search-index.json"
        ], {
          cwd: __dirname,
          stdio: "inherit"
        });
        if (result.status !== 0) {
          throw new Error("Failed to build geo2025 fallback data before Vite build");
        }
      }
    },
    {
      name: "anitabi-exporter-assets",
      configureServer(server) {
        server.middlewares.use("/api/geo2025", (request, response) => {
          const requestUrl = new URL(request.url || "/api/geo2025", "http://localhost");
          const bangumiId = requestUrl.searchParams.get("bangumiId") || "";
          const assetPath = /^\d+$/.test(bangumiId) ? `public/data/geo2025/works/${bangumiId}.json` : "public/data/geo2025/manifest.json";
          response.statusCode = 200;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.setHeader("cache-control", "no-store");
          response.end(readFileSync(assetPath));
        });
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
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
        popup: resolve(__dirname, "src/popup.html"),
        background: resolve(__dirname, "src/extension/background.ts"),
        content: resolve(__dirname, "src/extension/content.ts")
      },
      output: {
        entryFileNames(chunk) {
          return extensionEntries.has(chunk.name) ? "extension/[name].js" : "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
