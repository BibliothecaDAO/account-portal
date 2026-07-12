import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const MAX_CHUNK_GZIP_BYTES = 575 * 1024;
const MAX_TOTAL_GZIP_BYTES = 2_300 * 1024;

/** @typedef {{ name: string, gzipBytes: number }} BundleAsset */
/** @typedef {{ maxChunkGzipBytes?: number, maxTotalGzipBytes?: number }} BundleLimits */

/** @param {number} bytes */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

/**
 * @param {BundleAsset[]} assets
 * @param {BundleLimits} [limits]
 * @returns {string[]}
 */
export function evaluateBundleBudget(assets, limits = {}) {
  const {
    maxChunkGzipBytes = MAX_CHUNK_GZIP_BYTES,
    maxTotalGzipBytes = MAX_TOTAL_GZIP_BYTES,
  } = limits;
  const errors = assets
    .filter(({ gzipBytes }) => gzipBytes > maxChunkGzipBytes)
    .map(
      ({ name, gzipBytes }) =>
        `${name} is ${formatBytes(gzipBytes)} gzip (limit ${formatBytes(maxChunkGzipBytes)})`,
    );
  const totalGzipBytes = assets.reduce(
    (total, { gzipBytes }) => total + gzipBytes,
    0,
  );
  if (totalGzipBytes > maxTotalGzipBytes) {
    errors.push(
      `total JavaScript is ${formatBytes(totalGzipBytes)} gzip (limit ${formatBytes(maxTotalGzipBytes)})`,
    );
  }
  return errors;
}

/**
 * @param {URL} assetsDirectory
 * @returns {Promise<BundleAsset[]>}
 */
async function measureJavaScriptAssets(assetsDirectory) {
  const names = (await readdir(assetsDirectory)).filter((name) =>
    name.endsWith(".js"),
  );
  return Promise.all(
    names.map(async (name) => {
      const content = await readFile(new URL(name, assetsDirectory));
      return { name, gzipBytes: gzipSync(content).byteLength };
    }),
  );
}

async function main() {
  const assetsDirectory = new URL("../.output/public/assets/", import.meta.url);
  const assets = await measureJavaScriptAssets(assetsDirectory);
  if (assets.length === 0) {
    throw new Error("No JavaScript assets were found for bundle analysis");
  }
  const errors = evaluateBundleBudget(assets);
  const total = assets.reduce((sum, asset) => sum + asset.gzipBytes, 0);
  const largest = [...assets].sort((a, b) => b.gzipBytes - a.gzipBytes)[0];

  if (errors.length) {
    for (const error of errors)
      process.stderr.write(`Bundle budget: ${error}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `Bundle budget passed: ${assets.length} chunks, ${formatBytes(total)} gzip total, largest ${largest.name} at ${formatBytes(largest.gzipBytes)} gzip\n`,
  );
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
