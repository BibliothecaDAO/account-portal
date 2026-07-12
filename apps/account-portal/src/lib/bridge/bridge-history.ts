import { z } from "zod";

import {
  EthereumAddressSchema,
  StarknetAddressSchema,
} from "../validation/chain-address";

export const BridgeAccountsSchema = z
  .object({
    l1Account: EthereumAddressSchema.nullish().transform((address) =>
      address?.toLowerCase(),
    ),
    l2Account: StarknetAddressSchema.nullish(),
  })
  .refine(({ l1Account, l2Account }) => Boolean(l1Account ?? l2Account), {
    message: "At least one bridge account is required",
  });

export type BridgeAccounts = z.infer<typeof BridgeAccountsSchema>;

export function ethereumTransactionUrl(
  chain: string,
  transactionHash: string,
): string | null {
  if (chain === "mainnet") {
    return `https://etherscan.io/tx/${transactionHash}`;
  }
  if (chain === "sepolia") {
    return `https://sepolia.etherscan.io/tx/${transactionHash}`;
  }
  return null;
}

export function resolveBridgeOwnerAddresses({
  fromChain,
  l2Chain,
  fromAddress,
  toAddress,
}: {
  fromChain: string;
  l2Chain: string;
  fromAddress: string;
  toAddress: string;
}): { l1Address: string; l2Address: string } {
  return fromChain === l2Chain
    ? { l1Address: toAddress, l2Address: fromAddress }
    : { l1Address: fromAddress, l2Address: toAddress };
}
