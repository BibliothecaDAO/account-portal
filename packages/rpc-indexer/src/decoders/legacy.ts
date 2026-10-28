import type {
  ModifyLockEvent,
  RealmTransferEvent,
  RewardClaimedEvent,
  RewardReceivedEvent,
} from "./starknet";
import { toHex, toPaddedHex } from "../felt";

// Value formats written by the current Apibara indexers, used for parity
// checks and for reader adapters that must keep existing return contracts.
// Apibara's codec renders felts as 0x + 64 hex digits, so claims and veLORDS
// rows store padded addresses and transaction hashes. Ownership normalizes
// owners to unpadded hex and token IDs to decimal.

export interface LegacyContext {
  transactionHash: bigint;
  timestamp: Date;
}

export function toLegacyClaimRow(
  event: RewardClaimedEvent,
  context: LegacyContext,
) {
  const transactionHash = toPaddedHex(context.transactionHash);
  return {
    _id: transactionHash,
    hash: transactionHash,
    recipient: toPaddedHex(event.recipient),
    amount: event.amount.toString(),
    timestamp: context.timestamp,
  };
}

export function toLegacyRewardReceivedRow(
  event: RewardReceivedEvent,
  context: LegacyContext,
) {
  return {
    transaction_hash: toPaddedHex(context.transactionHash),
    sender: toPaddedHex(event.sender),
    amount: event.amount.toString(),
    timestamp: context.timestamp,
  };
}

export function toLegacyLockRow(
  event: ModifyLockEvent,
  context: LegacyContext,
) {
  return {
    transaction_hash: toPaddedHex(context.transactionHash),
    owner: toPaddedHex(event.owner),
    amount: event.amount.toString(),
    timestamp: context.timestamp,
    end_time: Number(event.endTime),
  };
}

export function toLegacyOwnership(event: RealmTransferEvent) {
  return {
    tokenId: event.tokenId.toString(),
    owner: event.to === 0n ? null : toHex(event.to),
    burned: event.to === 0n,
  };
}
