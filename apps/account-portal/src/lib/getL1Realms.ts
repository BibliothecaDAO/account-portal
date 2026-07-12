import type {
  AlchemyNftsResponse,
  L1TokenResponse,
} from "@/lib/alchemy/alchemy-nfts";
import { getServerEnvironment } from "@/config/environment";
import {
  collectAlchemyNfts,
  createAlchemyNftsUrl,
  mapAlchemyNfts,
} from "@/lib/alchemy/alchemy-nfts";
import { requestJson } from "@/lib/http/request-json";
import { EthereumAddressSchema } from "@/lib/validation/chain-address";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { env } from "env";
import { z } from "zod";

import {
  ChainId,
  CollectionAddresses,
  Collections,
} from "@realms-world/constants";

const SUPPORTED_L1_CHAIN_ID =
  env.VITE_PUBLIC_CHAIN === "sepolia" ? ChainId.SEPOLIA : ChainId.MAINNET;

const L1_REALMS_STALE_TIME_MS = 60_000;

function getRealmsContractAddress(): string {
  const address =
    CollectionAddresses[Collections.REALMS][SUPPORTED_L1_CHAIN_ID];
  if (!address) {
    throw new Error("Realms contract is not configured for the active chain");
  }
  return address;
}

/* -------------------------------------------------------------------------- */
/*                          getL1Realms Endpoint                              */
/* -------------------------------------------------------------------------- */

const GetL1RealmsInput = z.object({
  address: EthereumAddressSchema.optional(),
});

async function fetchAlchemyNfts({
  owner,
  contractAddress,
  withMetadata,
  pageSize,
  pageKey,
}: {
  owner: string;
  contractAddress: string;
  withMetadata: boolean;
  pageSize: number;
  pageKey?: string;
}): Promise<AlchemyNftsResponse> {
  const { ALCHEMY_API_KEY } = getServerEnvironment();
  const url = createAlchemyNftsUrl({
    network: env.VITE_PUBLIC_CHAIN,
    apiKey: ALCHEMY_API_KEY,
    owner,
    contractAddress,
    withMetadata,
    pageSize,
    pageKey,
  });
  return requestJson<AlchemyNftsResponse>(url, {
    requestName: "Alchemy NFT request",
  });
}

export const getL1Realms = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetL1RealmsInput.parse(input))
  .handler(async (ctx) => {
    if (!ctx.data.address) {
      return { tokens: [], continuation: null } as L1TokenResponse;
    }

    const owner = ctx.data.address;
    const contractAddress = getRealmsContractAddress();

    const data = await collectAlchemyNfts((pageKey) =>
      fetchAlchemyNfts({
        owner,
        contractAddress,
        withMetadata: true,
        pageSize: 100,
        pageKey,
      }),
    );
    return mapAlchemyNfts(data);
  });

export const getL1RealmsQueryOptions = (
  input?: z.infer<typeof GetL1RealmsInput>,
) => {
  return queryOptions({
    queryKey: ["getL1Realms", input?.address],
    queryFn: () =>
      input?.address != undefined
        ? getL1Realms({ data: input })
        : Promise.resolve({ tokens: [], continuation: null }),
    staleTime: L1_REALMS_STALE_TIME_MS,
    refetchInterval: false,
    enabled: !!input?.address,
  });
};

interface CollectionResponse {
  collections: {
    collection: {
      id: string;
      name: string;
    };
    ownership: {
      tokenCount: string;
    };
  }[];
}

export const getL1UsersRealms = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetL1RealmsInput.parse(input))
  .handler(async (ctx) => {
    if (!ctx.data.address) {
      return { collections: [] };
    }

    const contractAddress = getRealmsContractAddress();

    const data = await fetchAlchemyNfts({
      owner: ctx.data.address,
      contractAddress,
      withMetadata: false,
      pageSize: 1,
    });

    // Transform to match expected format for collection summary
    const hasNFTs = data.totalCount > 0;
    const collections =
      hasNFTs && contractAddress
        ? [
            {
              collection: {
                id: contractAddress,
                name: "Realms",
              },
              ownership: {
                tokenCount: data.totalCount.toString(),
              },
            },
          ]
        : [];

    return { collections } as CollectionResponse;
  });

export const getL1UsersRealmsQueryOptions = (
  input?: z.infer<typeof GetL1RealmsInput>,
) =>
  queryOptions({
    queryKey: ["getL1UsersRealms", input?.address],
    queryFn: () =>
      input?.address != undefined
        ? getL1UsersRealms({ data: input })
        : Promise.resolve({ collections: [] }),
    enabled: !!input?.address,
  });
