import { describe, expect, it } from "vitest";

import { getBridgeButtonState } from "./bridge-action";

const ready = {
  selectedCount: 2,
  needsApproval: false,
  isApproving: false,
  isBridgeDisabled: false,
  isBridging: false,
  isAccountBlocked: false,
  isCheckingAccount: false,
  hasAccountError: false,
  isAccountMissing: false,
};

describe("getBridgeButtonState", () => {
  it("does not let Approve Bridge run with nothing selected", () => {
    expect(
      getBridgeButtonState({ ...ready, needsApproval: true, selectedCount: 0 }),
    ).toEqual({ label: "Select Realms", disabled: true });
  });

  it("approves with a selection", () => {
    expect(getBridgeButtonState({ ...ready, needsApproval: true })).toEqual({
      label: "Approve Bridge",
      disabled: false,
    });
  });

  it("holds while approving", () => {
    expect(
      getBridgeButtonState({ ...ready, needsApproval: true, isApproving: true }),
    ).toEqual({ label: "Approving", disabled: true });
  });

  it("does not bridge with nothing selected", () => {
    expect(getBridgeButtonState({ ...ready, selectedCount: 0 })).toEqual({
      label: "Select Realms",
      disabled: true,
    });
  });

  it("bridges with a selection, and holds while sending or while the inventory is not ready", () => {
    expect(getBridgeButtonState(ready)).toEqual({
      label: "Bridge",
      disabled: false,
    });
    expect(getBridgeButtonState({ ...ready, isBridging: true }).disabled).toBe(
      true,
    );
    expect(
      getBridgeButtonState({ ...ready, isBridgeDisabled: true }).disabled,
    ).toBe(true);
  });

  it.each([
    [{ isCheckingAccount: true }, "Checking Starknet account..."],
    [{ hasAccountError: true }, "Unable to verify Starknet account"],
    [{ isAccountMissing: true }, "Deploy Starknet account first"],
  ])("blocks both buttons on the Starknet account: %j", (account, label) => {
    for (const needsApproval of [false, true]) {
      expect(
        getBridgeButtonState({
          ...ready,
          needsApproval,
          isAccountBlocked: true,
          ...account,
        }),
      ).toEqual({ label, disabled: true });
    }
  });

  it("does not let a cached account result block a withdrawal to Ethereum", () => {
    expect(
      getBridgeButtonState({
        ...ready,
        isAccountBlocked: false,
        isAccountMissing: true,
      }).disabled,
    ).toBe(false);
  });
});
