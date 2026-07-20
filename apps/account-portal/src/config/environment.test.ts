import { describe, expect, it } from "vitest";

import { parsePublicEnvironment, parseServerEnvironment } from "./environment";

describe("parsePublicEnvironment", () => {
  it("normalizes empty optional URLs without retaining server credentials", () => {
    const result = parsePublicEnvironment({
      VITE_PUBLIC_CHAIN: "mainnet",
      VITE_PUBLIC_SLOT: "eternum-prod",
      VITE_BASE_URL: "",
      VITE_TORII_API_URL: "https://torii.example.test",
      VITE_ALCHEMY_API_KEY: "must-not-enter-the-public-config",
    });

    expect(result.VITE_BASE_URL).toBeUndefined();
    expect(result.VITE_TORII_API_URL).toBe("https://torii.example.test");
    expect(result).not.toHaveProperty("VITE_ALCHEMY_API_KEY");
  });

  it.each([undefined, "", "not-a-url"])(
    "rejects a missing or invalid Torii URL (%s)",
    (VITE_TORII_API_URL) => {
      expect(() =>
        parsePublicEnvironment({
          VITE_PUBLIC_CHAIN: "mainnet",
          VITE_PUBLIC_SLOT: "eternum-prod",
          VITE_TORII_API_URL,
        }),
      ).toThrow();
    },
  );
});

describe("parseServerEnvironment", () => {
  it("reads credentials from server-only names", () => {
    expect(
      parseServerEnvironment({
        ALCHEMY_API_KEY: "alchemy-secret",
        ETHPLORER_API_KEY: "ethplorer-secret",
      }),
    ).toEqual({
      ALCHEMY_API_KEY: "alchemy-secret",
      ETHPLORER_API_KEY: "ethplorer-secret",
    });
  });

  it("supports legacy names on the server during migration", () => {
    expect(
      parseServerEnvironment({
        VITE_ALCHEMY_API_KEY: "legacy-alchemy-secret",
        VITE_ETHPLORER_APIKEY: "legacy-ethplorer-secret",
      }),
    ).toEqual({
      ALCHEMY_API_KEY: "legacy-alchemy-secret",
      ETHPLORER_API_KEY: "legacy-ethplorer-secret",
    });
  });
});
