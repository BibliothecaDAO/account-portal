import { toEthereumAddress, toStarknetAddress } from "./starknet-value";

const U128_MASK = (1n << 128n) - 1n;
const POSTGRES_INTEGER_MAX = 2_147_483_647n;

export type BridgeEventType =
  | "deposit_initiated_l1"
  | "deposit_initiated_l2"
  | "withdraw_available_l1"
  | "withdraw_completed_l1"
  | "withdraw_completed_l2";

export const BRIDGE_STORAGE_ID_COLUMNS = {
  "*": "_id",
  realms_bridge_events: "_event_id",
} as const;

function splitU256(value: bigint): readonly [bigint, bigint] {
  return [value & U128_MASK, value >> 128n];
}

export function buildBridgeRequestId({
  hash,
  ownerL1Address,
  ownerL2Address,
  tokenIds,
}: {
  hash: bigint;
  ownerL1Address: bigint;
  ownerL2Address: bigint;
  tokenIds: readonly bigint[];
}): string {
  const parts = [
    ...splitU256(hash),
    ownerL1Address,
    ownerL2Address,
    BigInt(tokenIds.length),
    ...tokenIds.flatMap((tokenId) => [...splitU256(tokenId)]),
  ];

  return parts.join(":");
}

export function buildBridgeEventId(
  requestId: string,
  eventType: BridgeEventType,
): string {
  if (!requestId) {
    throw new Error("Bridge request id is required");
  }
  return `${requestId}:${eventType}`;
}

export function buildBridgeRequestIdFromMessagingPayload(
  payload: readonly bigint[],
): string {
  const tokenCount = Number(payload[4]);
  const expectedLength = 5 + tokenCount * 2;

  if (!Number.isSafeInteger(tokenCount) || tokenCount < 0) {
    throw new Error("Invalid token count in bridge payload");
  }
  if (payload.length < expectedLength) {
    throw new Error("Insufficient data in bridge payload");
  }

  return payload.slice(0, expectedLength).join(":");
}

type MessagingEventName =
  | "LogMessageToL2"
  | "ConsumedMessageToL2"
  | "LogMessageToL1"
  | "ConsumedMessageToL1";

export function bridgeAccountsFromMessagingPayload(
  eventName: MessagingEventName,
  payload: readonly bigint[],
): { fromAddress: string; toAddress: string } {
  if (payload.length < 4) {
    throw new Error("Insufficient owner data in bridge payload");
  }

  const ownerL1 = payload[2];
  const ownerL2 = payload[3];

  const l1Address = toEthereumAddress(ownerL1);
  const l2Address = toStarknetAddress(ownerL2);
  const isMessageToL1 =
    eventName === "LogMessageToL1" || eventName === "ConsumedMessageToL1";

  return isMessageToL1
    ? { fromAddress: l2Address, toAddress: l1Address }
    : { fromAddress: l1Address, toAddress: l2Address };
}

export function toDatabaseTokenIds(tokenIds: readonly bigint[]): number[] {
  return tokenIds.map((tokenId) => {
    if (tokenId < 0n || tokenId > POSTGRES_INTEGER_MAX) {
      throw new RangeError(
        `Token id ${tokenId} is outside the database integer range`,
      );
    }
    return Number(tokenId);
  });
}
