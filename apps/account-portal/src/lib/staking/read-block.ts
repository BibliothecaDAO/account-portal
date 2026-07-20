import type { BlockNumber } from "starknet";
import { BlockTag } from "starknet";

export const STAKING_READ_BLOCK_IDENTIFIER =
  BlockTag.PRE_CONFIRMED as BlockNumber;
