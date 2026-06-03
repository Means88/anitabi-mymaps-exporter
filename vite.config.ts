import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const extensionEntries = new Set(["background", "content"]);

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
