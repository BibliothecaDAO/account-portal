import type { BridgeRealm } from "@/types/ark";

import type { L1TokenResponse } from "../alchemy/alchemy-nfts";

type L1Realm = L1TokenResponse["tokens"][number];

function parseL1TokenId(value: string): number {
  if (!/^(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(value)) {
    throw new Error(`Invalid L1 token ID: ${value}`);
  }

  const tokenId = BigInt(value);
  if (tokenId > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`Invalid L1 token ID: ${value}`);
  }

  return Number(tokenId);
}

export function mapL1RealmToBridgeRealm(realm: L1Realm): BridgeRealm {
  return {
    token_id: parseL1TokenId(realm.token.tokenId),
    name: realm.token.name ?? undefined,
    attributes: realm.token.attributes.map((attribute) => ({
      display_type: attribute.display_type,
      trait_type: attribute.trait_type ?? attribute.key,
      value: attribute.value,
    })),
  };
}
