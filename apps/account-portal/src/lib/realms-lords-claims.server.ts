import { getServerEnv } from "@/lib/server-env.server";
import { formatAddress } from "@/utils/utils";
import { env } from "env";
import { addAddressPadding } from "starknet";

import { desc, eq, realmsLordsClaims, sql } from "@realms-world/db";
import { db } from "@realms-world/db/client";

interface RpcClaimRow extends Record<string, unknown> {
  amount: string;
  recipient: string;
  timestamp: string;
  transaction_hash: string;
}

/** The legacy table's shape: padded hex, integer amount, UTC time without a zone. */
export function toClaim(row: RpcClaimRow) {
  const hash = addAddressPadding(row.transaction_hash);
  return {
    _id: hash,
    hash,
    amount: row.amount,
    recipient: addAddressPadding(row.recipient),
    timestamp: row.timestamp,
  };
}

/**
 * Past claims for a wallet, newest first. The legacy table stopped at March 2026 with its
 * indexer; CLAIMS_RPC_READS moves mainnet to the RPC worker's complete table, which keeps
 * addresses without their leading zeros.
 */
export async function findRealmsLordsClaims(address: string) {
  const recipient = formatAddress(address);
  if (!/^0x[0-9a-f]{64}$/.test(recipient)) return [];

  if (env.VITE_PUBLIC_CHAIN !== "mainnet" || !getServerEnv().CLAIMS_RPC_READS) {
    return db.query.realmsLordsClaims.findMany({
      where: eq(realmsLordsClaims.recipient, recipient),
      orderBy: desc(realmsLordsClaims.timestamp),
    });
  }

  const unpadded = `0x${BigInt(recipient).toString(16)}`;
  const { rows } = await db.execute<RpcClaimRow>(sql`
    SELECT
      transaction_hash,
      recipient,
      amount::text AS amount,
      to_char(block_timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS timestamp
    FROM rpc_indexer_mainnet_v1.realms_lords_claims
    WHERE recipient = ${unpadded}
    ORDER BY block_timestamp DESC
  `);
  return rows.map(toClaim);
}
