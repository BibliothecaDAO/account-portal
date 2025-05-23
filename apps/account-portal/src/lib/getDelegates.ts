//import { formatAddress } from "@/utils/utils";
import { auth } from "@/utils/auth";
import { formatAddress } from "@/utils/utils";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

import { and, desc, eq, like, sql } from "@realms-world/db";
// Make sure to import padAddress from its appropriate location
import { db } from "@realms-world/db/client";
import {
  CreateDelegateProfileSchema,
  delegateProfiles,
  delegates,
} from "@realms-world/db/schema";

/* -------------------------------------------------------------------------- */
/*                          getDelegates (all) Endpoint                       */
/* -------------------------------------------------------------------------- */

const GetDelegatesInput = z.object({
  limit: z.number().min(1).max(300).optional(),
  cursor: z.number().optional(),
  orderBy: z.string().optional(),
  search: z.string().optional(),
});

export const getDelegates = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetDelegatesInput.parse(input))
  .handler(async (ctx) => {
    const { limit, orderBy, search } = ctx.data;
    const actualLimit = limit ?? 100;
    const whereFilter = [];

    if (search) {
      whereFilter.push(like(delegates.id, `%${search}%`));
    }

    const items = await db.query.delegates.findMany({
      limit: actualLimit + 1,
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

    let nextCursor = undefined;
    if (items.length > actualLimit) {
      const nextItem = items.pop();
      nextCursor = parseInt(nextItem?.delegatedVotes ?? "0");
    }

    return { items: items, nextCursor };
  });

export const getDelegatesQueryOptions = (
  input: z.infer<typeof GetDelegatesInput>,
) =>
  queryOptions({
    queryKey: [
      "getDelegates",
      input.limit,
      input.cursor,
      input.orderBy,
      input.search,
    ],
    queryFn: () => getDelegates({ data: input }),
  });

/* -------------------------------------------------------------------------- */
/*                        getDelegateByID Endpoint                            */
/* -------------------------------------------------------------------------- */

const GetDelegateByIDInput = z.object({
  address: z.string().optional(),
});

export const getDelegateByID = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetDelegateByIDInput.parse(input))
  .handler(async (ctx) => {
    if (ctx.data.address) {
      const res = await db.query.delegates.findFirst({
        where: and(
          eq(delegates.user, ctx.data.address),
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
  .validator((input: unknown) => CreateDelegateProfileSchema.parse(input))
  .handler(async (ctx) => {
    console.log(ctx);

    const session = await auth.api.getSession({
      headers: getHeaders(),
      query: {
        // ensure session is fresh
        // https://www.better-auth.com/docs/concepts/session-management#session-caching
        disableCookieCache: true,
      },
    });
    console.log(session);
    if (!session) {
      return;
    }
    const delegateId = formatAddress(session.user.name ?? "");
    console.log(delegateId);
    return db
      .insert(delegateProfiles)
      .values({ ...ctx.data, delegateId })
      .onConflictDoUpdate({
        target: delegateProfiles.delegateId,
        set: { ...ctx.data },
      });
  });

export const createDelegateProfileMutationOptions = (
  input: z.infer<typeof CreateDelegateProfileSchema>,
) =>
  queryOptions({
    queryKey: ["createDelegateProfile", input],
    queryFn: () => createDelegateProfile({ data: input }),
  });
