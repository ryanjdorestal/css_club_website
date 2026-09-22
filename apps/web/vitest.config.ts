import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@brand": path.resolve(import.meta.dirname, "../../brand"),
      "@data": path.resolve(import.meta.dirname, "../../data"),
      "@content": path.resolve(import.meta.dirname, "../../content"),
      "@docs": path.resolve(import.meta.dirname, "../../docs"),
    },
  },
});
