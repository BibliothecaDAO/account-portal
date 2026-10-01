import type { BridgeHistorySnapshot, SQL } from "@realms-world/db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getBridgeNetworkConfig,
  normalizeL1Address,
  normalizeL2Address,
} from "@realms-world/bridge";
import {
  buildBridgeHistorySnapshotQuery,
  desc,
  eq,
  or,
  realmsBridgeRequests,
} from "@realms-world/db";
import { db } from "@realms-world/db/client";

import type { BridgeHistoryResponse } from "./bridge-history";
import { env } from "../../env";
import { getBridgeHistoryStatus, mergeBridgeHistory } from "./bridge-history";

const BRIDGE_TRANSACTIONS_POLL_INTERVAL_MS = 10_000;

function hasBridgeAccount(input?: z.infer<typeof GetBridgeTransactionsInput>) {
  return (input?.l1Account ?? input?.l2Account) != null;
}

/* -------------------------------------------------------------------------- */
/*                         getBridgeTransactions Endpoint                     */
/* -------------------------------------------------------------------------- */

const GetBridgeTransactionsInput = z.object({
  l1Account: z
    .string()
    .regex(/^0x[0-9a-fA-F]{1,40}$/)
    .nullable()
    .optional(),
  l2Account: z
    .string()
    .regex(/^0x[0-9a-fA-F]{1,64}$/)
    .refine((address) => {
      try {
        normalizeL2Address(address);
        return true;
      } catch {
        return false;
      }
    })
    .nullable()
    .optional(),
});

export const getBridgeTransactions = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => GetBridgeTransactionsInput.parse(input))
  .handler(async (ctx): Promise<BridgeHistoryResponse> => {
    const { l1Account, l2Account } = ctx.data;
    const network = env.VITE_PUBLIC_CHAIN === "sepolia" ? "sepolia" : "mainnet";
    const source = process.env.BRIDGE_HISTORY_SOURCE ?? "legacy";
    const unavailable: BridgeHistoryResponse = {
      status: "unavailable",
      network,
      transactions: [],
    };
    if (!l1Account && !l2Account) return unavailable;
    if (source === "hyperindex") {
      if (
        env.VITE_PUBLIC_CHAIN !== "mainnet" &&
        env.VITE_PUBLIC_CHAIN !== "sepolia"
      )
        return unavailable;
      try {
        const result = await db.execute<
          BridgeHistorySnapshot & Record<string, unknown>
        >(
          buildBridgeHistorySnapshotQuery({
            network,
            l1Schema:
              process.env.BRIDGE_HISTORY_L1_SCHEMA ??
              `hyperindex_l1_${network}`,
            l1Account: l1Account ? normalizeL1Address(l1Account) : undefined,
            l2Account: l2Account ? normalizeL2Address(l2Account) : undefined,
          }),
        );
        const snapshot = result.rows[0];
        if (!snapshot) return unavailable;
        return {
          network,
          status: getBridgeHistoryStatus(snapshot, network),
          transactions: mergeBridgeHistory(snapshot.events, network),
        };
      } catch {
        // Missing shadow tables, DB outages and inconsistent rows all fail closed.
        console.error("Bridge history snapshot unavailable");
        return unavailable;
      }
    }
    if (source !== "legacy") return unavailable;
    const whereFilter: SQL[] = [];

    if (l1Account) {
      whereFilter.push(
        eq(realmsBridgeRequests.from_address, l1Account.toLowerCase()),
        eq(realmsBridgeRequests.to_address, l1Account.toLowerCase()),
      );
    }
    if (l2Account) {
      whereFilter.push(
        eq(realmsBridgeRequests.from_address, l2Account.toLowerCase()),
        eq(realmsBridgeRequests.to_address, l2Account.toLowerCase()),
      );
    }
    const requests = await db.query.realmsBridgeRequests.findMany({
      where: or(...whereFilter),
      orderBy: desc(realmsBridgeRequests.timestamp),
      with: {
        events: true,
      },
    });
    const route = getBridgeNetworkConfig(network);
    return {
      status: "legacy",
      network,
      transactions: requests.map((request) => ({
        ...request,
        id: request._id,
        // Preserve legacy owner/explorer behavior until source-aware cutover.
        owner_l1: request.from_address,
        owner_l2: request.to_address,
        events: request.events.map((event) => ({
          ...event,
          id: `${event._id}:${event.type}`,
          source_chain: event.type.endsWith("l2")
            ? route.l2ChainId
            : String(route.l1ChainId),
        })),
      })),
    };
  });

export const getBridgeTransactionsQueryOptions = (
  input?: z.infer<typeof GetBridgeTransactionsInput>,
) =>
  queryOptions({
    queryKey: ["getBridgeTransactions", input],
    queryFn: () =>
      hasBridgeAccount(input) ? getBridgeTransactions({ data: input }) : null,
    enabled: hasBridgeAccount(input),
    refetchInterval: hasBridgeAccount(input)
      ? BRIDGE_TRANSACTIONS_POLL_INTERVAL_MS
      : false,
    refetchIntervalInBackground: false,
  });
