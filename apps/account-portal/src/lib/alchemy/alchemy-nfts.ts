export interface AlchemyNftAttribute {
  display_type?: string;
  key?: string;
  trait_type?: string;
  value?: string | number;
}

export interface AlchemyNft {
  tokenId: string;
  name?: string;
  title?: string;
  balance?: string;
  image?: { originalUrl?: string };
  media?: { gateway?: string }[];
  contract: {
    address: string;
    name?: string;
    symbol?: string;
  };
  raw?: {
    metadata?: {
      attributes?: AlchemyNftAttribute[];
    };
  };
}

export interface AlchemyNftsResponse {
  ownedNfts: AlchemyNft[];
  totalCount: number;
  pageKey?: string;
}

export interface L1TokenResponse {
  tokens: {
    token: {
      tokenId: string;
      name?: string | null;
      image?: string | null;
      collection: { id: string; name?: string; symbol?: string };
      attributes: AlchemyNftAttribute[];
    };
    ownership: { tokenCount: string; acquiredAt: null };
  }[];
  continuation: string | null;
}

export function createAlchemyNftsUrl({
  network,
  apiKey,
  owner,
  contractAddress,
  withMetadata,
  pageSize,
  pageKey,
}: {
  network: "mainnet" | "sepolia";
  apiKey: string;
  owner: string;
  contractAddress: string;
  withMetadata: boolean;
  pageSize: number;
  pageKey?: string;
}): URL {
  const url = new URL(
    `https://eth-${network}.g.alchemy.com/nft/v3/${encodeURIComponent(apiKey)}/getNFTsForOwner`,
  );
  url.searchParams.set("owner", owner);
  url.searchParams.append("contractAddresses[]", contractAddress);
  url.searchParams.set("withMetadata", String(withMetadata));
  url.searchParams.set("pageSize", String(pageSize));
  if (pageKey) url.searchParams.set("pageKey", pageKey);
  return url;
}

export async function collectAlchemyNfts(
  fetchPage: (pageKey?: string) => Promise<AlchemyNftsResponse>,
  maxPages = 100,
): Promise<AlchemyNftsResponse> {
  const ownedNfts: AlchemyNft[] = [];
  const seenCursors = new Set<string>();
  let pageKey: string | undefined;
  let totalCount = 0;

  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchPage(pageKey);
    ownedNfts.push(...result.ownedNfts);
    totalCount = result.totalCount;

    if (!result.pageKey) {
      return { ownedNfts, totalCount };
    }
    if (seenCursors.has(result.pageKey)) {
      throw new Error("Alchemy returned a repeated pagination cursor");
    }
    seenCursors.add(result.pageKey);
    pageKey = result.pageKey;
  }

  throw new Error(`Alchemy NFT pagination exceeded ${maxPages} pages`);
}

export function mapAlchemyNfts(data: AlchemyNftsResponse): L1TokenResponse {
  return {
    tokens: data.ownedNfts.map((nft) => ({
      token: {
        tokenId: nft.tokenId,
        name: nft.name ?? nft.title ?? null,
        image: nft.image?.originalUrl ?? nft.media?.[0]?.gateway ?? null,
        collection: {
          id: nft.contract.address,
          name: nft.contract.name,
          symbol: nft.contract.symbol,
        },
        attributes: nft.raw?.metadata?.attributes ?? [],
      },
      ownership: {
        tokenCount: nft.balance ?? "1",
        acquiredAt: null,
      },
    })),
    continuation: data.pageKey ?? null,
  };
}
