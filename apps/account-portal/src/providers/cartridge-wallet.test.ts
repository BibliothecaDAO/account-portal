import { describe, expect, it, vi } from "vitest";

import {
  adaptCartridgeWallet,
  createLazyCartridgeWallet,
} from "./cartridge-wallet";

describe("adaptCartridgeWallet", () => {
  it("adds the stable wallet API id without replacing the request handler", () => {
    const request = vi.fn();
    const legacyWallet = {
      version: "1.0.0",
      name: "Controller",
      icon: "data:image/svg+xml,<svg/>",
      chains: [],
      accounts: [],
      features: {
        "standard:connect": { version: "1.0.0", connect: vi.fn() },
        "standard:disconnect": { version: "1.0.0", disconnect: vi.fn() },
        "standard:events": { version: "1.0.0", on: vi.fn() },
        "starknet:walletApi": {
          version: "1.0.0" as const,
          walletVersion: "0.13.9",
          request,
        },
      },
    };

    const adapted = adaptCartridgeWallet(legacyWallet, "controller");

    expect(adapted.features["starknet:walletApi"]).toMatchObject({
      id: "controller",
      request,
    });
  });
});

describe("createLazyCartridgeWallet", () => {
  it("defers controller loading until connect and reuses one instance", async () => {
    const connect = vi.fn(() => Promise.resolve({ accounts: [] }));
    const request = vi.fn(() => Promise.resolve({ ok: true }));
    const realOn = vi.fn(() => vi.fn());
    const loadedWallet = {
      version: "1.0.0",
      name: "Controller",
      icon: "data:image/svg+xml,<svg/>",
      chains: [],
      accounts: [],
      features: {
        "standard:connect": { version: "1.0.0", connect },
        "standard:disconnect": { version: "1.0.0", disconnect: vi.fn() },
        "standard:events": { version: "1.0.0", on: realOn },
        "starknet:walletApi": {
          version: "1.0.0" as const,
          walletVersion: "0.13.9",
          request,
        },
      },
    };
    const loadWallet = vi.fn(() => Promise.resolve(loadedWallet));
    const wallet = createLazyCartridgeWallet({
      id: "controller",
      loadWallet,
      metadata: {
        version: "1.0.0",
        name: "Controller",
        icon: "data:image/svg+xml,<svg/>",
        chains: [],
        walletVersion: "0.13.9",
      },
    }) as unknown as {
      features: {
        "standard:connect": { connect: () => Promise<unknown> };
        "standard:events": {
          on: (event: string, listener: () => void) => () => void;
        };
        "starknet:walletApi": {
          request: (request: unknown) => Promise<unknown>;
        };
      };
    };

    const listener = vi.fn();
    wallet.features["standard:events"].on("change", listener);
    expect(loadWallet).not.toHaveBeenCalled();

    await wallet.features["standard:connect"].connect();
    await wallet.features["starknet:walletApi"].request({ type: "test" });

    expect(loadWallet).toHaveBeenCalledOnce();
    expect(connect).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledOnce();
    expect(realOn).toHaveBeenCalledWith("change", listener);
  });
});
