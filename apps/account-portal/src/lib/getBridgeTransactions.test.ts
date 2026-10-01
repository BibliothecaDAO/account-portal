import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getBridgeTransactions } from "./getBridgeTransactions";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  legacy: vi.fn(),
  env: { VITE_PUBLIC_CHAIN: "mainnet" },
}));
// Keep validation and endpoint logic; replace only the HTTP transport wrapper.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: (validate: (input: unknown) => unknown) => ({
      handler:
        (handler: (ctx: { data: unknown }) => unknown) =>
        (args: { data: unknown }) =>
          Promise.resolve().then(() => handler({ data: validate(args.data) })),
    }),
  }),
}));
vi.mock("../../env", () => ({ env: mocks.env }));
vi.mock("@realms-world/db/client", () => ({
  db: {
    execute: mocks.execute,
    query: { realmsBridgeRequests: { findMany: mocks.legacy } },
  },
}));

describe("bridge history endpoint cutover", () => {
  beforeEach(() => {
    mocks.execute.mockReset();
    mocks.legacy.mockReset().mockResolvedValue([]);
    mocks.env.VITE_PUBLIC_CHAIN = "mainnet";
    vi.stubEnv("BRIDGE_HISTORY_SOURCE", "hyperindex");
    vi.stubEnv("BRIDGE_HISTORY_L1_SCHEMA", "hyperindex_l1_mainnet");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("never queries all accounts when both wallets are absent", async () => {
    expect(await getBridgeTransactions({ data: {} })).toMatchObject({
      status: "unavailable",
      transactions: [],
    });
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.legacy).not.toHaveBeenCalled();
  });

  it("rejects malformed accounts before accessing either source", async () => {
    await expect(
      getBridgeTransactions({ data: { l1Account: "invalid" } }),
    ).rejects.toThrow();
    await expect(
      getBridgeTransactions({ data: { l2Account: `0x${"f".repeat(64)}` } }),
    ).rejects.toThrow();
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("returns unavailable without silently falling back when isolated storage fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.execute.mockRejectedValue(new Error("table absent"));
    expect(
      await getBridgeTransactions({ data: { l1Account: "0xabc" } }),
    ).toMatchObject({ status: "unavailable", transactions: [] });
    expect(mocks.execute).toHaveBeenCalledOnce();
    expect(mocks.legacy).not.toHaveBeenCalled();
  });

  it("uses one snapshot and reports missing progress even for empty history", async () => {
    mocks.execute.mockResolvedValue({
      rows: [{ events: [], l1_progress: null, l2_progress: null }],
    });
    expect(
      await getBridgeTransactions({ data: { l2Account: "0xabc" } }),
    ).toMatchObject({ status: "unavailable" });
    expect(mocks.execute).toHaveBeenCalledOnce();
  });

  it("keeps legacy selectable and fails closed for invalid configuration", async () => {
    vi.stubEnv("BRIDGE_HISTORY_SOURCE", "legacy");
    expect(
      await getBridgeTransactions({ data: { l1Account: "0xabc" } }),
    ).toMatchObject({ status: "legacy" });
    expect(mocks.legacy).toHaveBeenCalledOnce();
    vi.stubEnv("BRIDGE_HISTORY_SOURCE", "typo");
    expect(
      await getBridgeTransactions({ data: { l1Account: "0xabc" } }),
    ).toMatchObject({ status: "unavailable" });
    expect(mocks.legacy).toHaveBeenCalledOnce();
    vi.stubEnv("BRIDGE_HISTORY_SOURCE", "hyperindex");
    mocks.env.VITE_PUBLIC_CHAIN = "local";
    expect(
      await getBridgeTransactions({ data: { l1Account: "0xabc" } }),
    ).toMatchObject({ status: "unavailable" });
    expect(mocks.execute).not.toHaveBeenCalled();
  });
});
