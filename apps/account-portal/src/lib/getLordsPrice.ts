import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LORDS_DEXSCREENER_PAIR_ID =
  "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49-0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7-3402823669209384634633746074317682114-19802-0x0";

const LORDS_DEXSCREENER_API_URL = `https://api.dexscreener.com/latest/dex/pairs/starknet/${LORDS_DEXSCREENER_PAIR_ID}`;

interface DexscreenerPair {
  priceUsd?: string;
}

interface DexscreenerPairResponse {
  pair?: DexscreenerPair | null;
  pairs?: DexscreenerPair[] | null;
}

/** The pair's USD price. Throws when it is missing, so nobody mistakes it for a zero price. */
export function readLordsPriceUsd(data: DexscreenerPairResponse): string {
  const priceUsd = (data.pair ?? data.pairs?.[0])?.priceUsd;
  if (!priceUsd) {
    throw new Error("Dexscreener LORDS price response did not include priceUsd");
  }
  return priceUsd;
}

/* -------------------------------------------------------------------------- */
/*                          getLordsPriceUsd Endpoint                         */
/* -------------------------------------------------------------------------- */

const GetLordsPriceInput = z.object({}).optional();

export const getLordsPriceUsd = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => GetLordsPriceInput.parse(input))
  .handler(async (_ctx) => {
    const response = await fetch(LORDS_DEXSCREENER_API_URL, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(
        `Dexscreener LORDS price request failed: ${response.status}`,
      );
    }
    return readLordsPriceUsd((await response.json()) as DexscreenerPairResponse);
  });
