import { describe, expect, it, vi } from "vitest";

import { requestJson } from "./request-json";

describe("requestJson", () => {
  it("reports the upstream status without attempting to parse an error page", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(new Response("service unavailable", { status: 503 })),
    );

    await expect(
      requestJson("https://upstream.example/data", {
        fetchImpl,
        requestName: "Torii SQL request",
      }),
    ).rejects.toThrow("Torii SQL request failed with HTTP 503");
  });

  it("reports malformed JSON from an otherwise successful response", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        new Response("<html>not json</html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    await expect(
      requestJson("https://upstream.example/data", {
        fetchImpl,
        requestName: "Torii SQL request",
      }),
    ).rejects.toThrow("Torii SQL request returned invalid JSON");
  });

  it("aborts a stalled upstream request", async () => {
    const fetchImpl = vi.fn(
      async (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    await expect(
      requestJson("https://upstream.example/data", {
        fetchImpl,
        requestName: "Torii SQL request",
        timeoutMs: 5,
      }),
    ).rejects.toThrow("Torii SQL request timed out");
  });
});
