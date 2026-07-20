import type { SQL } from "@realms-world/db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { desc, eq, or, realmsBridgeRequests } from "@realms-world/db";
import { db } from "@realms-world/db/client";

import type { BridgeAccounts } from "./bridge/bridge-history";
import { BridgeAccountsSchema } from "./bridge/bridge-history";

const BRIDGE_TRANSACTIONS_POLL_INTERVAL_MS = 10_000;
const BRIDGE_TRANSACTIONS_LIMIT = 100;

function hasBridgeAccount(input?: Partial<BridgeAccounts>) {
  return (input?.l1Account ?? input?.l2Account) != null;
}

/* -------------------------------------------------------------------------- */
/*                         getBridgeTransactions Endpoint                     */
/* -------------------------------------------------------------------------- */

export const getBridgeTransactions = createServerFn({ method: "GET" })
  .validator((input: unknown) => BridgeAccountsSchema.parse(input))
  .handler(async (ctx) => {
    const { l1Account, l2Account } = ctx.data;
    const whereFilter: SQL[] = [];

    if (l1Account) {
      whereFilter.push(
        eq(realmsBridgeRequests.from_address, l1Account),
        eq(realmsBridgeRequests.to_address, l1Account),
      );
    }
    if (l2Account) {
      whereFilter.push(
        eq(realmsBridgeRequests.from_address, l2Account),
        eq(realmsBridgeRequests.to_address, l2Account),
      );
    }
    return db.query.realmsBridgeRequests.findMany({
      limit: BRIDGE_TRANSACTIONS_LIMIT,
      where: or(...whereFilter),
      orderBy: desc(realmsBridgeRequests.timestamp),
      with: {
        events: true,
      },
    });
  });

export const getBridgeTransactionsQueryOptions = (
  input?: Partial<BridgeAccounts>,
) =>
  queryOptions({
    queryKey: ["getBridgeTransactions", input],
    queryFn: () => {
      if (!hasBridgeAccount(input)) return Promise.resolve([]);
      return getBridgeTransactions({ data: BridgeAccountsSchema.parse(input) });
    },
    enabled: hasBridgeAccount(input),
    refetchInterval: hasBridgeAccount(input)
      ? BRIDGE_TRANSACTIONS_POLL_INTERVAL_MS
      : false,
    refetchIntervalInBackground: false,
  });
