import { describe, expect, it, vi } from "vitest";

import {
  JsonRpcClient,
  RpcResponseError,
  RpcTransportError,
} from "../src/rpc/json-rpc";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function client(responses: (Response | Error)[], maxRetries = 3) {
  const fetchMock = vi.fn(
    (_url: string | URL | Request, init?: RequestInit) => {
      const next = responses.shift();
      if (!next) throw new Error("no more responses");
      if (next instanceof Error) return Promise.reject(next);
      // Echo the request id so envelopes match.
      const { id } = JSON.parse(init?.body as string) as { id: number };
      return next
        .json()
        .then((body) =>
          jsonResponse(
            { ...(body as Record<string, unknown>), id },
            next.status,
          ),
        );
    },
  );
  const rpc = new JsonRpcClient({
    url: "https://secret.example/v2/API_KEY",
    label: "test-rpc",
    maxRetries,
    fetch: fetchMock as unknown as typeof fetch,
    sleep: () => Promise.resolve(),
    random: () => 0,
  });
  return { rpc, fetchMock };
}

describe("JsonRpcClient", () => {
  it("returns the result", async () => {
    const { rpc } = client([jsonResponse({ jsonrpc: "2.0", result: "0x1" })]);
    await expect(rpc.call("starknet_chainId", [])).resolves.toBe("0x1");
  });

  it("retries throttling delivered inside HTTP 200", async () => {
    const { rpc, fetchMock } = client([
      jsonResponse({
        jsonrpc: "2.0",
        error: { code: 429, message: "Too many requests" },
      }),
      jsonResponse({ jsonrpc: "2.0", result: 7 }),
    ]);
    await expect(rpc.call("m", [])).resolves.toBe(7);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries 5xx and network failures, then gives up", async () => {
    const { rpc, fetchMock } = client(
      [
        jsonResponse({}, 503),
        new TypeError("fetch failed"),
        jsonResponse({}, 502),
      ],
      2,
    );
    await expect(rpc.call("m", [])).rejects.toBeInstanceOf(RpcTransportError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry application errors or authorization failures", async () => {
    const app = client([
      jsonResponse({
        jsonrpc: "2.0",
        error: { code: 24, message: "Block not found" },
      }),
    ]);
    await expect(app.rpc.call("m", [])).rejects.toBeInstanceOf(
      RpcResponseError,
    );
    expect(app.fetchMock).toHaveBeenCalledTimes(1);

    const auth = client([jsonResponse({}, 401)]);
    await expect(auth.rpc.call("m", [])).rejects.toThrow("HTTP 401");
    expect(auth.fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never includes the endpoint URL in errors", async () => {
    const { rpc } = client([jsonResponse({}, 403)]);
    const error = await rpc.call("m", []).catch((caught: unknown) => caught);
    expect(String(error)).toContain("test-rpc");
    expect(String(error)).not.toContain("API_KEY");
  });

  it("rejects envelopes without result or error", async () => {
    const { rpc } = client([jsonResponse({ jsonrpc: "2.0" })]);
    await expect(rpc.call("m", [])).rejects.toThrow("neither result nor error");
  });
});
