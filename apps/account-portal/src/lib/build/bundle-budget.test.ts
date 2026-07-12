import { describe, expect, it } from "vitest";

import { evaluateBundleBudget } from "../../../scripts/bundle-budget.js";

describe("evaluateBundleBudget", () => {
  it("reports a chunk that exceeds the compressed limit", () => {
    expect(
      evaluateBundleBudget([{ name: "main.js", gzipBytes: 101 }], {
        maxChunkGzipBytes: 100,
        maxTotalGzipBytes: 1_000,
      }),
    ).toEqual(["main.js is 101 B gzip (limit 100 B)"]);
  });

  it("reports aggregate lazy and eager JavaScript growth", () => {
    expect(
      evaluateBundleBudget(
        [
          { name: "main.js", gzipBytes: 60 },
          { name: "lazy.js", gzipBytes: 50 },
        ],
        { maxChunkGzipBytes: 100, maxTotalGzipBytes: 100 },
      ),
    ).toEqual(["total JavaScript is 110 B gzip (limit 100 B)"]);
  });

  it("accepts artifacts within both limits", () => {
    expect(
      evaluateBundleBudget([{ name: "main.js", gzipBytes: 100 }], {
        maxChunkGzipBytes: 100,
        maxTotalGzipBytes: 100,
      }),
    ).toEqual([]);
  });
});
