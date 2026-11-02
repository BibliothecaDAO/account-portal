import { beforeEach, describe, expect, it, vi } from "vitest";

import { submitDelegation } from "./submit-delegation";

const toast = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/use-toast", () => ({ toast }));

describe("submitDelegation", () => {
  const send = vi.fn();
  const requestConnect = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("sends and says sent, not successful, when connected", async () => {
    send.mockResolvedValue({ transaction_hash: "0x1" });

    await submitDelegation({ isConnected: true, requestConnect, send });

    expect(requestConnect).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledOnce();
    expect(toast.mock.calls).toEqual([[{ description: "Delegation sent" }]]);
  });

  it("connects, sends nothing, and says to press Delegate again", async () => {
    requestConnect.mockResolvedValue(true);

    await submitDelegation({ isConnected: false, requestConnect, send });

    expect(requestConnect).toHaveBeenCalledOnce();
    expect(send).not.toHaveBeenCalled();
    expect(toast.mock.calls).toEqual([
      [{ description: "Wallet connected. Press Delegate again to sign." }],
    ]);
  });

  it("sends nothing and says nothing of its own when the connect does not finish", async () => {
    requestConnect.mockResolvedValue(false);

    await submitDelegation({ isConnected: false, requestConnect, send });

    expect(send).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it("reports a rejected signature, with no sent message", async () => {
    send.mockRejectedValue(new Error("User rejected the request"));

    await submitDelegation({ isConnected: true, requestConnect, send });

    expect(toast.mock.calls).toEqual([
      [
        {
          variant: "destructive",
          title: "Delegation not sent",
          description: "User rejected the request",
        },
      ],
    ]);
  });
});
