import { BlockTag } from "starknet";
import { describe, expect, it } from "vitest";

import { STAKING_READ_BLOCK_IDENTIFIER } from "./read-block";

describe("STAKING_READ_BLOCK_IDENTIFIER", () => {
  it("reads the latest pre-confirmed Starknet state", () => {
    expect(STAKING_READ_BLOCK_IDENTIFIER).toBe(BlockTag.PRE_CONFIRMED);
  });
});
