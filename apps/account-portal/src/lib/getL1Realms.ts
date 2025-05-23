import type { paths } from "@reservoir0x/reservoir-sdk";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  ChainId,
  CollectionAddresses,
  Collections,
} from "@realms-world/constants";

const SUPPORTED_L1_CHAIN_ID =
  process.env.VITE_PUBLIC_CHAIN === "sepolia"
    ? ChainId.SEPOLIA
    : ChainId.MAINNET;
const RESERVOIR_API_URL = new URL(
  `https://api${
    process.env.VITE_PUBLIC_CHAIN === "sepolia" ? "-sepolia" : ""
  }.reservoir.tools`,
);

/* -------------------------------------------------------------------------- */
/*                          getL1Realms Endpoint                              */
/* -------------------------------------------------------------------------- */

const GetL1RealmsInput = z.object({
  address: z.string(),
});

export const getL1Realms = createServerFn<
  "GET",
  undefined,
  z.infer<typeof GetL1RealmsInput>,
  paths["/users/{user}/tokens/v10"]["get"]["responses"]["200"]["schema"] | null
>({ method: "GET" })
  .validator((input: unknown) => GetL1RealmsInput.parse(input))
  .handler(async (ctx) => {
    console.log(`${RESERVOIR_API_URL}users/${ctx.data.address}/tokens/v10?collection=${
        CollectionAddresses[Collections.REALMS][SUPPORTED_L1_CHAIN_ID]
      }&limit=100&includeAttributes=true`)
    const response = await fetch(
      `${RESERVOIR_API_URL}users/${ctx.data.address.toLowerCase()}/tokens/v10?collection=${
        CollectionAddresses[Collections.REALMS][SUPPORTED_L1_CHAIN_ID]
      }&limit=100&includeAttributes=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.VITE_RESERVOIR_API_KEY ?? "",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
    return (await response.json()) as
      | paths["/users/{user}/tokens/v10"]["get"]["responses"]["200"]["schema"]
      | null;
  });

export const getL1RealmsQueryOptions = (
  input?: z.infer<typeof GetL1RealmsInput>,
) => {
  return queryOptions({
    queryKey: ["getL1Realms", input?.address],
    queryFn: () =>
      input?.address != undefined ? getL1Realms({ data: input }) : null,
    refetchInterval: 10000,
    enabled: !!input?.address,
  });
};

export const getL1UsersRealms = createServerFn<
  "GET",
  undefined,
  z.infer<typeof GetL1RealmsInput>,
  | paths["/users/{user}/collections/v4"]["get"]["responses"]["200"]["schema"]
  | null
>({ method: "GET" })
  .validator((input: unknown) => GetL1RealmsInput.parse(input))
  .handler(async (ctx) => {
    const response = await fetch(
      `${RESERVOIR_API_URL}/users/${ctx.data.address}/collections/v4?collection=${
        CollectionAddresses[Collections.REALMS][SUPPORTED_L1_CHAIN_ID]
      }&limit=100&includeAttributes=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.VITE_RESERVOIR_API_KEY ?? "",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
    const data = (await response.json()) as
      | paths["/users/{user}/collections/v4"]["get"]["responses"]["200"]["schema"]
      | null;
    return data;
  });

export const getL1UsersRealmsQueryOptions = (
  input?: z.infer<typeof GetL1RealmsInput>,
) =>
  queryOptions({
    queryKey: ["getL1UsersRealms", input?.address],
    queryFn: () => getL1UsersRealms({ data: input ?? {} }),
  });
