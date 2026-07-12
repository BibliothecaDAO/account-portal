import { describe, expect, it } from "vitest";

import type { SiwsNonceRecord, SiwsNonceStore } from "./siws-security";
import {
  consumeSiwsNonce,
  createSiwsNonce,
  issueSiwsNonce,
  isTrustedSiwsOrigin,
} from "./siws-security";

describe("createSiwsNonce", () => {
  it("encodes 32 bytes of cryptographic entropy as a 64-character nonce", () => {
    const entropy = Uint8Array.from({ length: 32 }, (_, index) => index);

    expect(createSiwsNonce(() => entropy)).toBe(
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
    );
  });
});

describe("issueSiwsNonce", () => {
  it("replaces any prior nonce for the wallet", async () => {
    const records = new Map([["siws_0xabc", "old-nonce"]]);

    const nonce = await issueSiwsNonce({
      address: "0xAbC",
      entropySource: () => new Uint8Array(32).fill(7),
      now: new Date("2026-07-12T02:00:00.000Z"),
      store: {
        replace: (identifier, value, expiresAt) => {
          records.set(identifier, value);
          expect(expiresAt).toEqual(new Date("2026-07-12T02:15:00.000Z"));
          return Promise.resolve();
        },
      },
    });

    expect(records).toEqual(new Map([["siws_0xabc", nonce]]));
  });
});

describe("isTrustedSiwsOrigin", () => {
  it("accepts the configured origin and equivalent local loopback hosts", () => {
    expect(
      isTrustedSiwsOrigin({
        configuredOrigin: "https://portal.realms.world",
        requestHost: "portal.realms.world",
        signedDomain: "portal.realms.world",
        signedUri: "https://portal.realms.world",
      }),
    ).toBe(true);
    expect(
      isTrustedSiwsOrigin({
        configuredOrigin: "http://localhost:3000",
        requestHost: "127.0.0.1:3000",
        signedDomain: "localhost:3000",
        signedUri: "http://localhost:3000",
      }),
    ).toBe(true);
  });

  it("rejects a signed domain or URI from another origin", () => {
    expect(
      isTrustedSiwsOrigin({
        configuredOrigin: "https://portal.realms.world",
        requestHost: "portal.realms.world",
        signedDomain: "evil.example",
        signedUri: "https://evil.example",
      }),
    ).toBe(false);
    expect(
      isTrustedSiwsOrigin({
        configuredOrigin: "https://portal.realms.world",
        requestHost: "portal.realms.world",
        signedDomain: "portal.realms.world",
        signedUri: "https://evil.example",
      }),
    ).toBe(false);
  });
});

describe("consumeSiwsNonce", () => {
  it("allows a valid nonce exactly once", async () => {
    const record: SiwsNonceRecord = {
      id: "verification-1",
      value: "signed-nonce",
      expiresAt: new Date("2026-07-12T02:15:00.000Z"),
    };
    const records = new Map([["siws_0xabc", record]]);
    const store: SiwsNonceStore = {
      take: (identifier, expectedValue) => {
        const candidate = records.get(identifier);
        if (candidate?.value !== expectedValue)
          return Promise.resolve(undefined);
        records.delete(identifier);
        return Promise.resolve(candidate);
      },
    };

    await consumeSiwsNonce({
      store,
      address: "0xAbC",
      signedNonce: "signed-nonce",
      now: new Date("2026-07-12T02:00:00.000Z"),
    });

    await expect(
      consumeSiwsNonce({
        store,
        address: "0xAbC",
        signedNonce: "signed-nonce",
        now: new Date("2026-07-12T02:00:01.000Z"),
      }),
    ).rejects.toThrow("Invalid or expired SIWS nonce");
  });
});
