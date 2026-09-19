import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@brand": path.resolve(__dirname, "../../brand"),
      "@data": path.resolve(__dirname, "../../data"),
      "@content": path.resolve(__dirname, "../../content"),
    },
  },
  server: {
    fs: { allow: [path.resolve(__dirname, "../..")] },
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
});
