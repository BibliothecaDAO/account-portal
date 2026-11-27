import { describe, expect, it } from "vitest";

import { getBridgeWithdrawalMessage } from "./bridge-withdrawal";

describe("L2 to L1 bridge withdrawal message", () => {
  it("reproduces the claimable mainnet message submitted by the bridge", () => {
    const message = getBridgeWithdrawalMessage("mainnet", {
      reqHash:
        "29203180383865108853271511929568201527851933988734205666355769646386238819128",
      ownerL1: "0xa66e02ad85461dbcb2800ccb8634f07c7497b9f2",
      ownerL2:
        "0x0721a6ca61a1ce9ed7d4d00ede9b5a75683de5620cb686e41416afef5db37ae6",
      tokenIds: [5973n],
    });

    expect(message.payload).toEqual([
      47517515292735721064405039216284240696n,
      85820433918194192604413931283368440047n,
      950145783199168457770625727422270971785256614386n,
      3225647039305201276101055897319319046098565249073506167455632960755000900326n,
      1n,
      5973n,
      0n,
    ]);
    expect(message.messageHash).toBe(
      "0x3c2721c0e264f084cee8283b69f7f573a75a21e8d281790eccafec626f2393a6",
    );
  });
});
