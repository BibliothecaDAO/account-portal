import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Native Node packaging tests run through test:shadow.
    exclude: [...configDefaults.exclude, "bridge-shadow/**"],
  },
});
