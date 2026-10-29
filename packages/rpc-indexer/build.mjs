import { build } from "esbuild";

// Bundle workspace TypeScript sources into standalone Node entrypoints so the
// production image runs `node dist/<entry>.mjs` without pnpm or a TS loader.
await build({
  entryPoints: { main: "src/main.ts", probe: "scripts/probe.ts" },
  outdir: "dist",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  sourcemap: true,
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  logLevel: "info",
});
