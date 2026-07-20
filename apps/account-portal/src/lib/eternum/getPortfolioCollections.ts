import { StarknetAddressSchema } from "@/lib/validation/chain-address";
import { SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { marketplaceCollections } from "@realms-world/constants";

import { parseToriiTokenId } from "./account-token";
import { fetchSQL } from "./apiClient";
import { QUERIES } from "./queries";

// Raw type for data fetched by fetchTokenBalancesWithMetadata
export interface RawTokenBalanceWithMetadata {
  token_id: string;
  balance: string;
  contract_address: string;
  token_owner: string; // This is account_address in the final type
  name?: string;
  symbol?: string;
  expiration?: number;
  best_price_hex?: string; // Raw hex string for bigint
  metadata?: string; // Raw JSON string
  order_id?: string;
}

export type AccountToken = Omit<RawTokenBalanceWithMetadata, "token_id"> & {
  token_id: number;
};

/* -------------------------------------------------------------------------- */
/*                             getAccountTokens Endpoint                             */
/* -------------------------------------------------------------------------- */

const GetAccountTokensInput = z.object({
  address: StarknetAddressSchema,
  collectionAddress: StarknetAddressSchema,
});

export const getAccountTokens = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetAccountTokensInput.parse(input))
  .handler(async (ctx) => {
    const { address, collectionAddress } = ctx.data;
    const collectionId =
      marketplaceCollections.realms.id[SUPPORTED_L2_CHAIN_ID];
    const query = QUERIES.TOKEN_BALANCES_WITH_METADATA.replaceAll(
      "{contractAddress}",
      collectionAddress,
    )
      .replace("{collectionId}", collectionId.toString())
      .replace("{accountAddress}", address);

    const result = await fetchSQL<RawTokenBalanceWithMetadata[]>(query);
    return result.map((token) => ({
      ...token,
      token_id: parseToriiTokenId(token.token_id),
    }));
  });

export const getAccountTokensQueryOptions = (input: {
  address?: string;
  collectionAddress: string;
}) =>
  queryOptions({
    queryKey: ["getAccountTokens", input.address, input.collectionAddress],
    queryFn: () =>
      input.address
        ? getAccountTokens({
            data: {
              address: input.address,
              collectionAddress: input.collectionAddress,
            },
          })
        : Promise.resolve([] as AccountToken[]),
    enabled: !!input.address,
  });
