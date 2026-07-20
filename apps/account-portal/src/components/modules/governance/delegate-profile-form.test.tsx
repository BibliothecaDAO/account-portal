// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DelegateProfileForm } from "./delegate-profile-form";

vi.mock("env", () => ({
  env: { VITE_PUBLIC_CHAIN: "mainnet", VITE_PUBLIC_SLOT: "production" },
}));
vi.mock("@/utils/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "0xabc" } } }),
  },
}));
vi.mock("./sign-in-with-starknet", () => ({
  Login: () => <button type="button">Sign in</button>,
}));

describe("DelegateProfileForm", () => {
  afterEach(cleanup);

  it("prevents duplicate profile saves while submission is pending", () => {
    render(
      <DelegateProfileForm
        delegate={{
          delegateProfile: {
            statement: "A production-ready delegate statement",
            interests: [],
            twitter: "",
            github: "",
            telegram: "",
            discord: "",
          },
        }}
        isSubmitting
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Saving Profile…" }),
    ).toBeDisabled();
  });
});
