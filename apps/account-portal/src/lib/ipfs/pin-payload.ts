import { pin } from "@snapshot-labs/pineapple";

export type IpfsPayload = Record<string, unknown>;

export interface PinResult {
  provider: string;
  cid: string;
}

export type PinImplementation = (
  payload: IpfsPayload,
) => Promise<{ provider?: unknown; cid?: unknown } | null | undefined>;

export async function pinPayload(
  payload: IpfsPayload,
  pinImpl: PinImplementation = pin,
): Promise<PinResult> {
  const result = await pinImpl(payload);
  if (
    !result ||
    typeof result.provider !== "string" ||
    typeof result.cid !== "string"
  ) {
    throw new Error("Failed to pin payload");
  }
  return { provider: result.provider, cid: result.cid };
}
