import type { BridgeNetwork } from "@realms-world/bridge";
import { encodePacked, keccak256 } from "viem";

import {
  getBridgeNetworkConfig,
  normalizeBridgeRequest,
} from "@realms-world/bridge";

export function getBridgeWithdrawalMessage(
  network: BridgeNetwork,
  request: {
    reqHash: bigint | string;
    ownerL1: bigint | string;
    ownerL2: bigint | string;
    tokenIds: readonly (bigint | string)[];
  },
) {
  const route = getBridgeNetworkConfig(network);
  const normalized = normalizeBridgeRequest(network, "withdrawal", request);
  const payload = normalized.payload.map(BigInt);
  const messageHash = keccak256(
    encodePacked(
      ["uint256", "uint256", "uint256", "uint256[]"],
      [
        BigInt(route.l2BridgeAddress),
        BigInt(route.l1BridgeAddress),
        BigInt(payload.length),
        payload,
      ],
    ),
  );

  return { messageHash, payload, route };
}
