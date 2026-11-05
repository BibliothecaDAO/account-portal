import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { findRealmsLordsClaims } from "./realms-lords-claims.server";

const mocks = vi.hoisted(() => ({
  chain: { VITE_PUBLIC_CHAIN: "mainnet" },
  execute: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("env", () => ({ env: mocks.chain }));
vi.mock("@realms-world/db/client", () => ({
  db: {
    execute: mocks.execute,
    query: { realmsLordsClaims: { findMany: mocks.findMany } },
  },
}));

const short = "0x169840391c49315c9a94df8723f5fddceae1a7ad8c3388faa9d1f28cc3d6632";
const padded = "0x0169840391c49315c9a94df8723f5fddceae1a7ad8c3388faa9d1f28cc3d6632";

describe("findRealmsLordsClaims", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.chain.VITE_PUBLIC_CHAIN = "mainnet";
    mocks.findMany.mockResolvedValue([]);
    mocks.execute.mockResolvedValue({ rows: [] });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("reads the legacy table unless the flag is on", async () => {
    await findRealmsLordsClaims(short);

    expect(mocks.findMany).toHaveBeenCalledOnce();
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("returns RPC rows in the legacy shape when the flag is on", async () => {
    vi.stubEnv("CLAIMS_RPC_READS", "true");
    mocks.execute.mockResolvedValue({
      rows: [
        {
          transaction_hash: "0x6740c54183",
          recipient: short,
          amount: "3079807418981461770700",
          timestamp: "2026-03-26 02:53:42",
        },
      ],
    });

    await expect(findRealmsLordsClaims(short)).resolves.toEqual([
      {
        _id: `0x${"6740c54183".padStart(64, "0")}`,
        hash: `0x${"6740c54183".padStart(64, "0")}`,
        amount: "3079807418981461770700",
        recipient: padded,
        timestamp: "2026-03-26 02:53:42",
      },
    ]);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("stays on the legacy table off mainnet, where there is no RPC schema", async () => {
    vi.stubEnv("CLAIMS_RPC_READS", "true");
    mocks.chain.VITE_PUBLIC_CHAIN = "sepolia";

    await findRealmsLordsClaims(short);

    expect(mocks.findMany).toHaveBeenCalledOnce();
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("returns nothing for a value that is not an address", async () => {
    vi.stubEnv("CLAIMS_RPC_READS", "true");

    await expect(findRealmsLordsClaims("not-an-address")).resolves.toEqual([]);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("fails rather than showing an empty history when the read fails", async () => {
    vi.stubEnv("CLAIMS_RPC_READS", "true");
    mocks.execute.mockRejectedValue(new Error("db down"));

    await expect(findRealmsLordsClaims(short)).rejects.toThrow("db down");
  });
});
