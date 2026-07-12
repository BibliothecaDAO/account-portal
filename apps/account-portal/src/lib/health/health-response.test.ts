import { describe, expect, it } from "vitest";

import { createHealthResponse } from "./health-response";

describe("createHealthResponse", () => {
  it("returns a cache-free liveness response without secrets", async () => {
    const response = createHealthResponse({
      now: new Date("2026-07-12T02:00:00.000Z"),
      revision: "abc123",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      timestamp: "2026-07-12T02:00:00.000Z",
      revision: "abc123",
    });
  });
});
