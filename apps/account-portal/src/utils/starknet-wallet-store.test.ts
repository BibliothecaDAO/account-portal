import { afterAll, describe, expect, it, vi } from "vitest";

// Minimal browser window: get-starknet scans its own properties for
// `starknet_*` wallets and uses events for standard/EIP-6963 discovery.
const fakeWindow = new EventTarget() as EventTarget & Record<string, unknown>;
vi.stubGlobal("window", fakeWindow);

const { starknetWalletStore, rescanInjectedWallets } = await import(
  "./starknet-wallet-store"
);

const injectedWallet = (id: string, name: string) => ({
  id,
  name,
  version: "1.0.0",
  icon: "data:image/svg+xml;base64,",
  request: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});

describe("rescanInjectedWallets", () => {
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("finds extension wallets that inject after the initial scan, once", () => {
    expect(starknetWalletStore.getWallets()).toHaveLength(0);

    fakeWindow.starknet_argentX = injectedWallet("argentX", "Ready X");
    rescanInjectedWallets();
    rescanInjectedWallets();

    expect(starknetWalletStore.getWallets().map((w) => w.name)).toEqual([
      "Ready X",
    ]);
  });
});
