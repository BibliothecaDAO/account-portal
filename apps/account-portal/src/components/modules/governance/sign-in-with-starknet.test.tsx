// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Login } from "./sign-in-with-starknet";

const mocks = vi.hoisted(() => ({
  nonce: vi.fn(),
  refetch: vi.fn(),
  signOut: vi.fn(),
  signTypedDataAsync: vi.fn(),
  verify: vi.fn(),
}));

vi.mock("env", () => ({ env: { VITE_PUBLIC_CHAIN: "mainnet" } }));
vi.mock("@/components/icons/starknet.svg?react", () => ({
  default: () => <svg aria-hidden="true" />,
}));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({
    address: "0xabc",
    chainId: BigInt("0x534e5f4d41494e"),
  }),
  useSignTypedData: () => ({
    isPending: false,
    signTypedDataAsync: mocks.signTypedDataAsync,
  }),
}));
vi.mock("@/utils/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: null, refetch: mocks.refetch }),
    siws: { nonce: mocks.nonce, verify: mocks.verify },
    signOut: mocks.signOut,
  },
}));

describe("Starknet sign-in workflow", () => {
  beforeEach(() => {
    mocks.nonce.mockReset();
    mocks.refetch.mockReset();
    mocks.signTypedDataAsync.mockReset();
    mocks.verify.mockReset();
  });

  afterEach(cleanup);

  it("recovers and explains when nonce creation fails", async () => {
    mocks.nonce.mockRejectedValueOnce(new Error("service unavailable"));

    render(<Login />);
    const button = screen.getByRole("button", {
      name: /sign in to edit profile/i,
    });
    await userEvent.click(button);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to sign in. Please try again.",
    );
    expect(button).toBeEnabled();
  });

  it("refreshes the session after a successful signature", async () => {
    mocks.nonce.mockResolvedValueOnce({ data: { nonce: "signed-nonce" } });
    mocks.signTypedDataAsync.mockResolvedValueOnce(["0x1", "0x2"]);
    mocks.verify.mockResolvedValueOnce({ data: { token: "session-token" } });

    render(<Login />);
    await userEvent.click(
      screen.getByRole("button", { name: /sign in to edit profile/i }),
    );

    await waitFor(() => expect(mocks.refetch).toHaveBeenCalledOnce());
  });
});
