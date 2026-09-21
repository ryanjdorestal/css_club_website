import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@brand": path.resolve(__dirname, "../../brand"),
      "@data": path.resolve(__dirname, "../../data"),
      "@content": path.resolve(__dirname, "../../content"),
      "@docs": path.resolve(__dirname, "../../docs"),
    },
  },
});
