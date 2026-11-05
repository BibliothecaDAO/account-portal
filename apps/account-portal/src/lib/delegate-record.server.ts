import { getStarknetRpcUrl } from "@/utils/starknet-rpc";
import { formatAddress, SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { env } from "env";
import { RpcProvider, uint256, validateAndParseAddress } from "starknet";

import { CollectionAddresses } from "@realms-world/constants";
import { and, desc, eq, like, sql } from "@realms-world/db";
import { db } from "@realms-world/db/client";
import {
  delegateProfiles,
  delegates,
  starknetDelegates,
} from "@realms-world/db/schema";

import { mergeDelegateList } from "./delegate-list-merge";
import { getServerEnv } from "./server-env.server";

/** Saved ids are not all padded or lowercase; this is the padded form the tables key on. */
const canonicalProfileAddress = sql<string>`'0x' || lpad(ltrim(substr(lower(${delegateProfiles.delegateId}), 3), '0'), 64, '0')`;

const isValidProfileAddress = sql`${delegateProfiles.delegateId} ~* '^0x[0-9a-f]+$'`;

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

async function findIndexedDelegate(user: string) {
  const [row] = await db
    .select({
      address: starknetDelegates.address,
      votes: starknetDelegates.votes,
      holders: starknetDelegates.token_holders_represented,
      delegateProfile: delegateProfiles,
    })
    .from(starknetDelegates)
    .leftJoin(delegateProfiles, eq(canonicalProfileAddress, starknetDelegates._id))
    .where(eq(starknetDelegates._id, user))
    .limit(1);
  if (!row) return null;
  return {
    id: row.address,
    user: row.address,
    delegatedVotes: row.votes,
    tokenHoldersRepresentedAmount: row.holders,
    delegateProfile: row.delegateProfile,
  };
}

/**
 * The delegate's indexed row, or the same shape built from the chain and their profile.
 * Anyone with no row is read from the chain: the frozen table has missed everyone since
 * it stopped, and the chain stays right if the new indexer is behind.
 */
export async function findDelegateRecord(address: string) {
  const user = formatAddress(address);
  const row = getServerEnv().DELEGATES_INDEXER_READS
    ? await findIndexedDelegate(user)
    : await db.query.delegates.findFirst({
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

interface DelegateListInput {
  limit: number;
  orderBy: "desc" | "random";
  search?: string;
}

async function findLegacyDelegateRows({ limit, orderBy, search }: DelegateListInput) {
  const rows = await db.query.delegates.findMany({
    limit: limit + 1,
    where: and(
      search ? like(delegates.id, `%${search}%`) : undefined,
      sql`upper_inf(block_range)`,
    ),
    orderBy: orderBy === "desc" ? desc(delegates.delegatedVotes) : sql`RANDOM()`,
    with: { delegateProfile: true },
    columns: { block_range: false },
  });
  return rows.map((row) => ({
    id: row.id,
    user: row.user,
    delegatedVotes: row.delegatedVotes as string | null,
    tokenHoldersRepresentedAmount: row.tokenHoldersRepresentedAmount as number | null,
    delegateProfile: row.delegateProfile,
  }));
}

async function findIndexedDelegateRows({ limit, orderBy, search }: DelegateListInput) {
  const rows = await db
    .select({
      address: starknetDelegates.address,
      votes: starknetDelegates.votes,
      holders: starknetDelegates.token_holders_represented,
      delegateProfile: delegateProfiles,
    })
    .from(starknetDelegates)
    .leftJoin(delegateProfiles, eq(canonicalProfileAddress, starknetDelegates._id))
    .where(search ? like(starknetDelegates._id, `%${search}%`) : undefined)
    .orderBy(
      ...(orderBy === "desc"
        ? [desc(starknetDelegates.votes), starknetDelegates._id]
        : [sql`RANDOM()`]),
    )
    .limit(limit + 1);
  return rows.map((row) => ({
    id: row.address,
    user: row.address,
    delegatedVotes: row.votes as string | null,
    tokenHoldersRepresentedAmount: row.holders as number | null,
    delegateProfile: row.delegateProfile,
  }));
}

/**
 * Saved profiles with no current delegate row. Backfilled indexer data means no row is
 * truly 0 votes; the frozen table cannot say, so there the votes are null (unknown).
 */
async function findProfilesWithoutRow(
  { limit, search }: DelegateListInput,
  useIndexer: boolean,
) {
  const hasRow = useIndexer
    ? sql`EXISTS (SELECT 1 FROM ${starknetDelegates} WHERE ${starknetDelegates._id} = ${canonicalProfileAddress})`
    : sql`EXISTS (SELECT 1 FROM ${delegates} WHERE ${delegates.user} = ${canonicalProfileAddress} AND upper_inf(${delegates.block_range}))`;
  const profiles = await db
    .select()
    .from(delegateProfiles)
    .where(
      and(
        isValidProfileAddress,
        sql`NOT ${hasRow}`,
        search ? like(canonicalProfileAddress, `%${search}%`) : undefined,
      ),
    )
    .orderBy(desc(delegateProfiles.createdAt))
    .limit(limit + 1);

  const byAddress = new Map<string, (typeof profiles)[number]>();
  for (const profile of profiles) {
    try {
      const user = validateAndParseAddress(profile.delegateId ?? "");
      if (!byAddress.has(user)) byAddress.set(user, profile);
    } catch {
      // Not an address anyone could delegate to.
    }
  }
  return [...byAddress].map(([user, delegateProfile]) => ({
    id: user,
    user,
    delegatedVotes: useIndexer ? "0" : null,
    tokenHoldersRepresentedAmount: useIndexer ? 0 : null,
    delegateProfile,
  }));
}

export async function findDelegateList(input: DelegateListInput) {
  const useIndexer = getServerEnv().DELEGATES_INDEXER_READS;
  const [rows, profiles] = await Promise.all([
    useIndexer ? findIndexedDelegateRows(input) : findLegacyDelegateRows(input),
    findProfilesWithoutRow(input, useIndexer),
  ]);
  return mergeDelegateList(rows, profiles, input);
}
