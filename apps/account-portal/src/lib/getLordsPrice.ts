import { getServerEnvironment } from "@/config/environment";
import { requestJson } from "@/lib/http/request-json";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface EthplorerToken {
  address: string;
  decimals: string;
  symbol: string;
  name: string;
  price?: {
    rate: string;
    diff7d: string;
    marketCapUsd: string;
    volume24h: string;
  };
}

/* -------------------------------------------------------------------------- */
/*                          getLordsInfo Endpoint                             */
/* -------------------------------------------------------------------------- */

const GetLordsInfoInput = z.object({}).optional();

export const getLordsInfo = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetLordsInfoInput.parse(input))
  .handler(async (_ctx) => {
    const { ETHPLORER_API_KEY } = getServerEnvironment();
    if (!ETHPLORER_API_KEY) {
      throw new Error("ETHPLORER_API_KEY is required to fetch LORDS pricing");
    }
    const url = new URL(
      "https://api.ethplorer.io/getTokenInfo/0x686f2404e77ab0d9070a46cdfb0b7fecdd2318b0",
    );
    url.searchParams.set("apiKey", ETHPLORER_API_KEY);
    url.searchParams.set("chainId", "1");
    return requestJson<EthplorerToken>(url, {
      requestName: "Ethplorer LORDS request",
    });
  });
