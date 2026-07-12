export function parseToriiTokenId(value: string): number {
  const separatorIndex = value.lastIndexOf(":");
  const tokenId = value.slice(separatorIndex + 1);

  if (separatorIndex <= 0 || !/^0x[0-9a-fA-F]+$/.test(tokenId)) {
    throw new Error(`Invalid Torii token ID: ${value}`);
  }

  const parsed = BigInt(tokenId);
  if (parsed > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`Invalid Torii token ID: ${value}`);
  }

  return Number(parsed);
}
