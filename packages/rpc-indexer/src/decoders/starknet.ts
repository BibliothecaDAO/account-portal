import type { StarknetEvent } from "../chains/starknet";
import type { Felt } from "../felt";
import { parseFelt, parseU64, parseU128, parseU256 } from "../felt";

// Pure decoders for every enabled Starknet event family. Layouts follow the
// ABIs embedded in packages/apibara/indexers: `#[key]` members are read from
// keys[1..] in declaration order and the rest from data. Each decoder checks
// the exact felt count so an ABI change fails loudly instead of misreading.

// starknet_keccak of each event name; test/decoders.test.ts recomputes them
// with starknet.js so the runtime bundle does not need that library.
export const STARKNET_SELECTORS = {
  Transfer: "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9",
  RewardClaimed:
    "0x2b4ef075f33846f8ea9fa7aba29494f66d476da788baa878816e0c9fba18a9b",
  ModifyLock: "0xb99edd6afc064880b73685c9611cf8e64008c3d8948f260361dfc195ab3c8",
  RewardReceived:
    "0x607773c7bd62d61e2c0f982d3d7e01dbe54fccba4182e0fa4d031087333a3a",
  DepositRequestInitiated:
    "0x1682ccdc90fbee2d6cc3e930539cb4ca29390a438db1c2e4c7d493e01a61abb",
  WithdrawRequestCompleted:
    "0x132aab9714c265c8ad151ce006bb91691100722ddec42e7ee96dc9dfa9e741c",
} as const satisfies Record<string, Felt>;

export type StarknetEventKind = keyof typeof STARKNET_SELECTORS;

export class DecodeError extends Error {
  constructor(kind: string, event: StarknetEvent, reason: string) {
    super(
      `Cannot decode ${kind} in tx ${event.transactionHash} (block ${event.blockNumber}, tx index ${event.transactionIndex}, event ${event.eventIndexInTransaction}): ${reason}`,
    );
    this.name = "DecodeError";
  }
}

export interface RealmTransferEvent {
  kind: "Transfer";
  from: bigint;
  to: bigint;
  tokenId: bigint;
}

export interface RewardClaimedEvent {
  kind: "RewardClaimed";
  recipient: bigint;
  amount: bigint;
}

export interface ModifyLockEvent {
  kind: "ModifyLock";
  caller: bigint;
  owner: bigint;
  amount: bigint;
  endTime: bigint;
}

export interface RewardReceivedEvent {
  kind: "RewardReceived";
  sender: bigint;
  amount: bigint;
}

export interface BridgeRequestContent {
  hash: bigint;
  ownerL1: bigint;
  ownerL2: bigint;
  tokenIds: bigint[];
}

export interface BridgeRequestEvent {
  kind: "DepositRequestInitiated" | "WithdrawRequestCompleted";
  hash: bigint;
  blockTimestamp: bigint;
  request: BridgeRequestContent;
}

export type DecodedStarknetEvent =
  | RealmTransferEvent
  | RewardClaimedEvent
  | ModifyLockEvent
  | RewardReceivedEvent
  | BridgeRequestEvent;

function expectLength(
  kind: string,
  event: StarknetEvent,
  keys: number,
  data: number,
) {
  if (event.keys.length !== keys || event.data.length !== data) {
    throw new DecodeError(
      kind,
      event,
      `expected ${keys} keys and ${data} data felts, got ${event.keys.length} and ${event.data.length}`,
    );
  }
}

function decodeTransfer(event: StarknetEvent): RealmTransferEvent {
  expectLength("Transfer", event, 5, 0);
  const [, from, to, low, high] = event.keys;
  return {
    kind: "Transfer",
    from: parseFelt(from, "from"),
    to: parseFelt(to, "to"),
    tokenId: parseU256(low, high, "token_id"),
  };
}

function decodeRewardClaimed(event: StarknetEvent): RewardClaimedEvent {
  expectLength("RewardClaimed", event, 2, 2);
  return {
    kind: "RewardClaimed",
    recipient: parseFelt(event.keys[1], "recipient"),
    amount: parseU256(event.data[0], event.data[1], "amount"),
  };
}

function decodeModifyLock(event: StarknetEvent): ModifyLockEvent {
  expectLength("ModifyLock", event, 3, 2);
  return {
    kind: "ModifyLock",
    caller: parseFelt(event.keys[1], "caller"),
    owner: parseFelt(event.keys[2], "owner"),
    amount: parseU128(event.data[0], "amount"),
    endTime: parseU64(event.data[1], "end_time"),
  };
}

function decodeRewardReceived(event: StarknetEvent): RewardReceivedEvent {
  expectLength("RewardReceived", event, 2, 2);
  return {
    kind: "RewardReceived",
    sender: parseFelt(event.keys[1], "sender"),
    amount: parseU256(event.data[0], event.data[1], "amount"),
  };
}

function decodeBridgeRequest(
  kind: BridgeRequestEvent["kind"],
  event: StarknetEvent,
): BridgeRequestEvent {
  // keys: selector, hash.low, hash.high, block_timestamp
  // data: Request { hash: u256, owner_l1: EthAddress, owner_l2, ids: Span<u256> }
  if (event.keys.length !== 4 || event.data.length < 5) {
    throw new DecodeError(kind, event, "unexpected bridge request layout");
  }
  const count = parseFelt(event.data[4], "ids.len");
  if (event.data.length !== 5 + Number(count) * 2) {
    throw new DecodeError(
      kind,
      event,
      `ids length ${count} does not match data`,
    );
  }
  const tokenIds: bigint[] = [];
  for (let index = 0; index < Number(count); index++) {
    const offset = 5 + index * 2;
    tokenIds.push(
      parseU256(event.data[offset], event.data[offset + 1], `ids[${index}]`),
    );
  }
  const keyHash = parseU256(event.keys[1], event.keys[2], "hash");
  const request: BridgeRequestContent = {
    hash: parseU256(event.data[0], event.data[1], "req_content.hash"),
    ownerL1: parseFelt(event.data[2], "req_content.owner_l1"),
    ownerL2: parseFelt(event.data[3], "req_content.owner_l2"),
    tokenIds,
  };
  if (request.ownerL1 >= 2n ** 160n) {
    throw new DecodeError(kind, event, "owner_l1 is not an Ethereum address");
  }
  return {
    kind,
    hash: keyHash,
    blockTimestamp: parseU64(event.keys[3], "block_timestamp"),
    request,
  };
}

const DECODERS = new Map<Felt, (event: StarknetEvent) => DecodedStarknetEvent>([
  [STARKNET_SELECTORS.Transfer, decodeTransfer],
  [STARKNET_SELECTORS.RewardClaimed, decodeRewardClaimed],
  [STARKNET_SELECTORS.ModifyLock, decodeModifyLock],
  [STARKNET_SELECTORS.RewardReceived, decodeRewardReceived],
  [
    STARKNET_SELECTORS.DepositRequestInitiated,
    (event) => decodeBridgeRequest("DepositRequestInitiated", event),
  ],
  [
    STARKNET_SELECTORS.WithdrawRequestCompleted,
    (event) => decodeBridgeRequest("WithdrawRequestCompleted", event),
  ],
]);

/** Decode by keys[0]. Unknown selectors are an error: filters must match decoders. */
export function decodeStarknetEvent(
  event: StarknetEvent,
): DecodedStarknetEvent {
  const key = event.keys[0];
  const decode = key === undefined ? undefined : DECODERS.get(key);
  if (!decode) {
    throw new DecodeError("event", event, `no decoder for selector ${key}`);
  }
  try {
    return decode(event);
  } catch (error) {
    if (error instanceof DecodeError) throw error;
    throw new DecodeError(
      "event",
      event,
      error instanceof Error ? error.message : String(error),
    );
  }
}
