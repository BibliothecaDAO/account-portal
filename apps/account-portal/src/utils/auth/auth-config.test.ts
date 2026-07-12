import { describe, expect, it } from "vitest";

import { resolveAuthRuntimeConfig } from "./auth-config";

describe("resolveAuthRuntimeConfig", () => {
  it("requires an explicit public origin and strong secret in production", () => {
    expect(() =>
      resolveAuthRuntimeConfig({
        nodeEnv: "production",
        baseUrl: undefined,
        secret: "too-short",
      }),
    ).toThrow("VITE_BASE_URL");

    expect(() =>
      resolveAuthRuntimeConfig({
        nodeEnv: "production",
        baseUrl: "https://portal.realms.world",
        secret: "too-short",
      }),
    ).toThrow("BETTER_AUTH_SECRET");

    expect(() =>
      resolveAuthRuntimeConfig({
        nodeEnv: "production",
        baseUrl: "http://portal.realms.world",
        secret: "a".repeat(32),
      }),
    ).toThrow("HTTPS");
  });

  it("returns a canonical trusted origin", () => {
    const config = resolveAuthRuntimeConfig({
      nodeEnv: "production",
      baseUrl: "https://portal.realms.world/some/path",
      secret: "a".repeat(32),
    });

    expect(config).toEqual({
      baseURL: "https://portal.realms.world",
      secret: "a".repeat(32),
      trustedOrigins: ["https://portal.realms.world"],
    });
  });

  it("uses localhost only for local development", () => {
    expect(
      resolveAuthRuntimeConfig({
        nodeEnv: "development",
        baseUrl: undefined,
        secret: undefined,
      }),
    ).toEqual({
      baseURL: "http://localhost:3000",
      secret: undefined,
      trustedOrigins: ["http://localhost:3000"],
    });
  });

  it("allows loopback HTTP for production artifact smoke tests", () => {
    expect(
      resolveAuthRuntimeConfig({
        nodeEnv: "production",
        baseUrl: "http://127.0.0.1:3000",
        secret: "a".repeat(32),
      }).baseURL,
    ).toBe("http://127.0.0.1:3000");
  });
});
