import {
  ChainId,
  REALMS_BRIDGE_ADDRESS,
  STARKNET_MESSAGING,
} from "@realms-world/constants";

export type BridgeNetwork = "mainnet" | "sepolia";
export type BridgeDirection = "deposit" | "withdrawal";
export const BRIDGE_EVENT_TYPES = [
  "deposit_initiated_l1",
  "deposit_initiated_l2",
  "withdraw_available_l1",
  "withdraw_completed_l1",
  "withdraw_completed_l2",
] as const;
export type BridgeEventType = (typeof BRIDGE_EVENT_TYPES)[number];

const UINT128_LIMIT = 1n << 128n;
const UINT256_LIMIT = 1n << 256n;
const STARKNET_ADDRESS_LIMIT = (1n << 251n) - 256n;

function unsigned(value: bigint | string, limit: bigint, name: string): bigint {
  if (typeof value === "string" && !/^(?:[0-9]+|0x[0-9a-fA-F]+)$/.test(value)) {
    throw new Error(`Invalid ${name}`);
  }
  const parsed = BigInt(value);
  if (parsed < 0n || parsed >= limit) throw new Error(`Invalid ${name}`);
  return parsed;
}

export function normalizeL1Address(value: bigint | string): `0x${string}` {
  return `0x${unsigned(value, 1n << 160n, "L1 address")
    .toString(16)
    .padStart(40, "0")}`;
}

export function normalizeL2Address(value: bigint | string): `0x${string}` {
  return `0x${unsigned(value, STARKNET_ADDRESS_LIMIT, "L2 address").toString(16)}`;
}

export function getBridgeNetworkConfig(network: BridgeNetwork) {
  if (!["mainnet", "sepolia"].includes(network)) {
    throw new Error("Unsupported bridge network");
  }
  const l1ChainId = network === "mainnet" ? ChainId.MAINNET : ChainId.SEPOLIA;
  const l2ChainId =
    network === "mainnet" ? ChainId.SN_MAIN : ChainId.SN_SEPOLIA;
  const l1Bridge = REALMS_BRIDGE_ADDRESS[l1ChainId];
  const l2Bridge = REALMS_BRIDGE_ADDRESS[l2ChainId];
  if (!l1Bridge || !l2Bridge) throw new Error("Missing bridge address");
  return {
    l1ChainId: Number(l1ChainId),
    l2ChainId: String(l2ChainId),
    messagingAddress: normalizeL1Address(STARKNET_MESSAGING[l1ChainId]),
    l1BridgeAddress: normalizeL1Address(l1Bridge),
    l2BridgeAddress: normalizeL2Address(l2Bridge),
    l1StartBlock: network === "mainnet" ? 20_433_152 : 6_180_467,
  };
}

export interface NormalizedBridgeRequest {
  requestKey: string;
  network: BridgeNetwork;
  direction: BridgeDirection;
  reqHash: string;
  ownerL1: `0x${string}`;
  ownerL2: `0x${string}`;
  tokenIds: string[];
  payload: string[];
}

function limbs(value: bigint) {
  return [value % UINT128_LIMIT, value / UINT128_LIMIT];
}

export function normalizeBridgeRequest(
  network: BridgeNetwork,
  direction: BridgeDirection,
  request: {
    reqHash: bigint | string;
    ownerL1: bigint | string;
    ownerL2: bigint | string;
    tokenIds: readonly (bigint | string)[];
  },
): NormalizedBridgeRequest {
  const route = getBridgeNetworkConfig(network);
  if (!["deposit", "withdrawal"].includes(direction)) {
    throw new Error("Invalid bridge direction");
  }
  const hash = unsigned(request.reqHash, UINT256_LIMIT, "request hash");
  const ownerL1 = normalizeL1Address(request.ownerL1);
  const ownerL2 = normalizeL2Address(request.ownerL2);
  const tokens = request.tokenIds.map((id) =>
    unsigned(id, UINT256_LIMIT, "token ID"),
  );
  const requestKey = [
    route.l1ChainId,
    route.l2ChainId,
    route.l1BridgeAddress,
    route.l2BridgeAddress,
    direction,
    hash.toString(),
  ].join(":");
  return {
    requestKey,
    network,
    direction,
    reqHash: hash.toString(),
    ownerL1,
    ownerL2,
    tokenIds: tokens.map(String),
    payload: [
      ...limbs(hash),
      BigInt(ownerL1),
      BigInt(ownerL2),
      BigInt(tokens.length),
      ...tokens.flatMap(limbs),
    ].map(String),
  };
}

export function decodeBridgePayload(
  network: BridgeNetwork,
  direction: BridgeDirection,
  payload: readonly bigint[],
): NormalizedBridgeRequest {
  const [low, high, ownerL1, ownerL2, count] = payload;
  if (
    low === undefined ||
    high === undefined ||
    ownerL1 === undefined ||
    ownerL2 === undefined ||
    count === undefined
  ) {
    throw new Error("Bridge payload is missing its header");
  }
  if (count < 0n || count * 2n !== BigInt(payload.length - 5)) {
    throw new Error("Bridge token count does not match payload length");
  }
  const joinLimbs = (lo: bigint, hi: bigint) =>
    unsigned(lo, UINT128_LIMIT, "low limb") +
    unsigned(hi, UINT128_LIMIT, "high limb") * UINT128_LIMIT;
  const tokenIds: bigint[] = [];
  for (let i = 5; i < payload.length; i += 2) {
    const lo = payload[i];
    const hi = payload[i + 1];
    if (lo === undefined || hi === undefined)
      throw new Error("Missing token limb");
    tokenIds.push(joinLimbs(lo, hi));
  }
  return normalizeBridgeRequest(network, direction, {
    reqHash: joinLimbs(low, high),
    ownerL1,
    ownerL2,
    tokenIds,
  });
}

export function createBridgeEventId(
  sourceChain: string,
  blockHash: string,
  transactionHash: string,
  logIndex: number,
): string {
  if (
    !/^(?:[0-9]+|0x[0-9a-fA-F]+)$/.test(sourceChain) ||
    !Number.isSafeInteger(logIndex) ||
    logIndex < 0
  ) {
    throw new Error("Invalid bridge event identity");
  }
  const hash = (value: string) => {
    if (!/^0x[0-9a-fA-F]{1,64}$/.test(value))
      throw new Error("Invalid event hash");
    return `0x${value.slice(2).toLowerCase().padStart(64, "0")}`;
  };
  return `${sourceChain.toLowerCase()}:${hash(blockHash)}:${hash(transactionHash)}:${logIndex}`;
}

export function bridgeTokenIdsToNumbers(ids: readonly string[]): number[] {
  return ids.map((id) =>
    Number(unsigned(id, BigInt(Number.MAX_SAFE_INTEGER) + 1n, "UI token ID")),
  );
}
