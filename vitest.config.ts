/// <reference types="vitest" />
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
  },
});
