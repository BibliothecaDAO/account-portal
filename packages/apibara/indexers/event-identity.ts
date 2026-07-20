export function buildIndexerEventId(
  transactionHash: string,
  eventIndex: number,
): string {
  if (!transactionHash || !Number.isSafeInteger(eventIndex) || eventIndex < 0) {
    throw new Error("Invalid indexer event identity");
  }
  return `${transactionHash}:${eventIndex}`;
}
