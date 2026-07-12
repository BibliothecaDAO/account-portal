import type { TokenMetadataAttribute } from "@/types/ark";

export interface RealmMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: TokenMetadataAttribute[];
}

export function parseRealmMetadata(
  metadata: string | null | undefined,
): RealmMetadata | null {
  if (!metadata) return null;

  try {
    const parsed = JSON.parse(metadata) as unknown;
    return typeof parsed === "object" && parsed !== null
      ? (parsed as RealmMetadata)
      : null;
  } catch {
    return null;
  }
}
