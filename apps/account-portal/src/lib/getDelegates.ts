import type { DelegateQuery } from "@/lib/governance/delegate-input";
import {
  DelegateProfileInputSchema,
  DelegateQuerySchema,
} from "@/lib/governance/delegate-input";
import { StarknetAddressSchema } from "@/lib/validation/chain-address";
import { auth } from "@/utils/auth";
import { formatAddress } from "@/utils/utils";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { and, desc, eq, like, sql } from "@realms-world/db";
import { db } from "@realms-world/db/client";
import { delegateProfiles, delegates } from "@realms-world/db/schema";

/* -------------------------------------------------------------------------- */
/*                          getDelegates (all) Endpoint                       */
/* -------------------------------------------------------------------------- */

export const getDelegates = createServerFn({ method: "GET" })
  .validator((input: unknown) => DelegateQuerySchema.parse(input))
  .handler(async (ctx) => {
    const { limit, orderBy, search } = ctx.data;
    const whereFilter = [];

    if (search) {
      whereFilter.push(like(delegates.id, `%${search}%`));
    }

    const items = await db.query.delegates.findMany({
      limit,
      where: and(...whereFilter, sql`upper_inf(block_range)`),
      orderBy:
        orderBy === "desc" ? desc(delegates.delegatedVotes) : sql`RANDOM()`,
      with: {
        delegateProfile: true,
      },
      columns: {
        block_range: false,
      },
    });

    return { items };
  });

export const getDelegatesQueryOptions = (input: DelegateQuery) =>
  queryOptions({
    queryKey: ["getDelegates", input.limit, input.orderBy, input.search],
    queryFn: () => getDelegates({ data: input }),
  });

/* -------------------------------------------------------------------------- */
/*                        getDelegateByID Endpoint                            */
/* -------------------------------------------------------------------------- */

const GetDelegateByIDInput = z.object({
  address: StarknetAddressSchema.optional(),
});

export const getDelegateByID = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetDelegateByIDInput.parse(input))
  .handler(async (ctx) => {
    if (ctx.data.address) {
      const res = await db.query.delegates.findFirst({
        where: and(
          eq(delegates.user, formatAddress(ctx.data.address)),
          sql`upper_inf(block_range)`,
        ),
        with: { delegateProfile: true },
        columns: {
          block_range: false,
        },
      });
      return res ?? null;
    }
    return null;
  });

export const getDelegateByIDQueryOptions = (
  input: z.infer<typeof GetDelegateByIDInput>,
) =>
  queryOptions({
    queryKey: ["getDelegateByID", input.address],
    queryFn: () => (input.address ? getDelegateByID({ data: input }) : null),
    enabled: !!input.address,
  });

/* -------------------------------------------------------------------------- */
/*                        createDelegateProfile Endpoint                    */
/* -------------------------------------------------------------------------- */

export const createDelegateProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => DelegateProfileInputSchema.parse(input))
  .handler(async (ctx) => {
    const { headers } = getRequest();
    const session = await auth.api.getSession({
      headers,
      query: {
        // ensure session is fresh
        // https://www.better-auth.com/docs/concepts/session-management#session-caching
        disableCookieCache: true,
      },
    });
    if (!session) {
      return { success: false as const };
    }
    const delegateId = formatAddress(session.user.id);
    await db
      .insert(delegateProfiles)
      .values({ ...ctx.data, delegateId })
      .onConflictDoUpdate({
        target: delegateProfiles.delegateId,
        set: { ...ctx.data },
      });
    return { success: true as const };
  });
