import { describe, expect, it } from "vitest";

import { parseApibaraEnvironment } from "./environment";

describe("parseApibaraEnvironment", () => {
  it.each(["mainnet", "sepolia"])("accepts the %s deployment", (chain) => {
    expect(parseApibaraEnvironment({ VITE_PUBLIC_CHAIN: chain })).toEqual({
      VITE_PUBLIC_CHAIN: chain,
    });
  });

  it.each(["local", "testnet", "invalid"])(
    "rejects unsupported chain value %s",
    (chain) => {
      expect(() =>
        parseApibaraEnvironment({ VITE_PUBLIC_CHAIN: chain }),
      ).toThrow();
    },
  );
});
