import { fileURLToPath } from "node:url";
// Minimal Vite config for Storybook. The app's vite.config.ts loads the TanStack Start
// and Nitro plugins, which expect a server runtime; Storybook only needs React, Tailwind,
// SVG components and the tsconfig path aliases (`@/…` and `env`).
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    viteReact(),
    svgr({ include: "**/*.svg?react" }),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // Server functions need the Start runtime; stories only use fixture props.
      {
        find: /^@tanstack\/react-start(\/server)?$/,
        replacement: fileURLToPath(new URL("./mocks/react-start.ts", import.meta.url)),
      },
      // Server modules import the database client when they load; no story may reach it.
      {
        find: /^@realms-world\/db\/client$/,
        replacement: fileURLToPath(new URL("./mocks/db-client.ts", import.meta.url)),
      },
    ],
  },
  // Stories never talk to the network; let env.ts fall back to its CI defaults.
  define: { "import.meta.env.CI": JSON.stringify("true") },
});
