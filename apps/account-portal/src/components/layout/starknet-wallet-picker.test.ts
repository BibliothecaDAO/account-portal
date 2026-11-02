import { beforeEach, describe, expect, it, vi } from "vitest";
import { connectFromPicker } from "./starknet-wallet-picker";

const { toast } = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ toast }));

describe("connectFromPicker", () => {
  beforeEach(() => {
    toast.mockClear();
  });

  it("says the wallet connected and nothing was signed when it connects", async () => {
    await expect(connectFromPicker(() => Promise.resolve(true))).resolves.toBe(
      true,
    );

    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({
      description: "Wallet connected. Nothing has been signed yet.",
    });
  });

  it("says nothing when the wallet does not connect", async () => {
    await expect(connectFromPicker(() => Promise.resolve(false))).resolves.toBe(
      false,
    );

    expect(toast).not.toHaveBeenCalled();
  });
});
