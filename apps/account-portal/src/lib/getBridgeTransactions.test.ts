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

  it("maps legacy withdrawal owners into the contract payload order", async () => {
    vi.stubEnv("BRIDGE_HISTORY_SOURCE", "legacy");
    mocks.legacy.mockResolvedValue([
      {
        _id: "request",
        from_chain: "0x534e5f4d41494e",
        from_address:
          "0x0721a6ca61a1ce9ed7d4d00ede9b5a75683de5620cb686e41416afef5db37ae6",
        to_address: "0xa66e02ad85461dbcb2800ccb8634f07c7497b9f2",
        token_ids: [5973],
        timestamp: new Date("2026-11-20T04:48:59Z"),
        tx_hash: "0x123",
        req_hash:
          "29203180383865108853271511929568201527851933988734205666355769646386238819128",
        events: [],
      },
    ]);

    const response = await getBridgeTransactions({
      data: { l1Account: "0xa66e02ad85461dbcb2800ccb8634f07c7497b9f2" },
    });

    expect(response.transactions[0]).toMatchObject({
      owner_l1: "0xa66e02ad85461dbcb2800ccb8634f07c7497b9f2",
      owner_l2:
        "0x721a6ca61a1ce9ed7d4d00ede9b5a75683de5620cb686e41416afef5db37ae6",
    });
  });

  it("keeps legacy withdrawals that stored the L1 owner as from_address", async () => {
    vi.stubEnv("BRIDGE_HISTORY_SOURCE", "legacy");
    mocks.legacy.mockResolvedValue([
      {
        _id: "request",
        from_chain: "0x534e5f4d41494e",
        from_address: "0xcb094a9bcf54961985619a0217c4c7d8e4c3538a",
        to_address:
          "0x42e4be5fb46f66baa890a6e92e29b294817651d51453c3f1b2e722d2f857c34",
        token_ids: [1],
        timestamp: new Date("2025-02-28T11:31:11Z"),
        tx_hash: "0x123",
        req_hash: "1",
        events: [],
      },
    ]);

    const response = await getBridgeTransactions({
      data: { l1Account: "0xcb094a9bcf54961985619a0217c4c7d8e4c3538a" },
    });

    expect(response.transactions[0]).toMatchObject({
      owner_l1: "0xcb094a9bcf54961985619a0217c4c7d8e4c3538a",
      owner_l2:
        "0x42e4be5fb46f66baa890a6e92e29b294817651d51453c3f1b2e722d2f857c34",
    });
  });
});
