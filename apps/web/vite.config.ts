import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

import { execSync } from "node:child_process";

let sha = "dev";
try {
  sha = execSync("git rev-parse --short HEAD").toString().trim();
} catch {}

// https://vite.dev/config/
export default defineConfig({
  define: {
    "import.meta.env.VITE_GIT_SHA": JSON.stringify(sha),
    "import.meta.env.VITE_BUILD_TIME": JSON.stringify(new Date().toISOString().slice(0, 16) + "Z"),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@brand": path.resolve(__dirname, "../../brand"),
      "@data": path.resolve(__dirname, "../../data"),
      "@content": path.resolve(__dirname, "../../content"),
      "@docs": path.resolve(__dirname, "../../docs"),
    },
  },
  server: {
    fs: { allow: [path.resolve(__dirname, "../..")] },
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
  // `vite preview` serves the shipped bundle for the a11y and Lighthouse gates; without the same
  // proxy every /api call would fall through to index.html and the page would quietly run on its
  // Tier 1 JSON, which is not what those gates are meant to measure.
  preview: {
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
});
