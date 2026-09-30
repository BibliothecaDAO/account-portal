import { defineConfig } from "apibara/config";

// Separate build entrypoint: importing the runtime cannot construct unrelated
// indexers or require their environment variables.
export default defineConfig({
  runtimeConfig: {},
  exportConditions: ["node"],
});
