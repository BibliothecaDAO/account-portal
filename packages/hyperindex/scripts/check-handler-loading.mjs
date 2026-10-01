// Offline packaging smoke test through the same loader used by the pinned runtime.
// In particular this exercises tsx + esbuild and workspace TypeScript exports.
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const envioDirectory = dirname(require.resolve("envio"));
const loader = await import(
  pathToFileURL(resolve(envioDirectory, "src/HandlerLoader.res.mjs"))
);
await loader.autoLoadFromSrcHandlers("src/handlers");
console.log("HyperIndex TypeScript handlers and workspace imports loaded");
