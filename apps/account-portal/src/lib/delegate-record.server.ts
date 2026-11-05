import { getStarknetRpcUrl } from "@/utils/starknet-rpc";
import { formatAddress, SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { env } from "env";
import { RpcProvider, uint256 } from "starknet";

import { CollectionAddresses } from "@realms-world/constants";
import { and, eq, sql } from "@realms-world/db";
import { db } from "@realms-world/db/client";
import { delegateProfiles, delegates } from "@realms-world/db/schema";

/** A profile is keyed by the padded address the wallet session signs in with. */
export async function findDelegateProfile(address: string) {
  const profile = await db.query.delegateProfiles.findFirst({
    where: eq(delegateProfiles.delegateId, formatAddress(address)),
  });
  return profile ?? null;
}

async function readDelegatedVotes(address: string) {
  const provider = new RpcProvider({
    nodeUrl: getStarknetRpcUrl(
      env.VITE_PUBLIC_CHAIN === "sepolia" ? "sepolia" : "mainnet",
    ),
  });
  const [low = "0x0", high = "0x0"] = await provider.callContract({
    contractAddress: CollectionAddresses.realms[SUPPORTED_L2_CHAIN_ID] as string,
    entrypoint: "get_votes",
    calldata: [address],
  });
  return uint256.uint256ToBN({ low, high }).toString();
}

/**
 * The delegate's indexed row, or the same shape built from the chain and their profile.
 * The delegates indexer no longer runs, so anyone who delegated since it stopped has no row.
 */
export async function findDelegateRecord(address: string) {
  const user = formatAddress(address);
  const row = await db.query.delegates.findFirst({
    where: and(eq(delegates.user, user), sql`upper_inf(block_range)`),
    with: { delegateProfile: true },
    columns: { block_range: false },
  });
  if (row) return row;

  const [delegatedVotes, delegateProfile] = await Promise.all([
    readDelegatedVotes(user),
    findDelegateProfile(user),
  ]);
  return {
    id: user,
    user,
    delegatedVotes,
    tokenHoldersRepresentedAmount: null,
    delegateProfile,
  };
}
