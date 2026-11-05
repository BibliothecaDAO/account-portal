//import { formatAddress } from "@/utils/utils";
import { auth } from "@/utils/auth";
import { formatAddress } from "@/utils/utils";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import {
  findDelegateList,
  findDelegateProfile,
  findDelegateRecord,
} from "./delegate-record.server";

import {db} from "@realms-world/db/client"
import { CreateDelegateProfileSchema, delegateProfiles } from "@realms-world/db/schema";
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
  .inputValidator((input: unknown) => GetDelegatesInput.parse(input))
  .handler(async (ctx) => {
    const { limit, orderBy, search } = ctx.data;
    return findDelegateList({
      limit: limit ?? 100,
      orderBy: orderBy === "desc" ? "desc" : "random",
      search,
    });
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
  .inputValidator((input: unknown) => GetDelegateByIDInput.parse(input))
  .handler(async (ctx) => {
    if (ctx.data.address) {
      return findDelegateRecord(ctx.data.address);
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
/*                        getDelegateProfile Endpoint                         */
/* -------------------------------------------------------------------------- */

const GetDelegateProfileInput = z.object({
  address: z.string().optional(),
});

export const getDelegateProfile = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => GetDelegateProfileInput.parse(input))
  .handler(async (ctx) =>
    ctx.data.address ? findDelegateProfile(ctx.data.address) : null,
  );

export const getDelegateProfileQueryOptions = (
  input: z.infer<typeof GetDelegateProfileInput>,
) =>
  queryOptions({
    queryKey: ["getDelegateProfile", input.address],
    queryFn: () => (input.address ? getDelegateProfile({ data: input }) : null),
    enabled: !!input.address,
  });

/* -------------------------------------------------------------------------- */
/*                        createDelegateProfile Endpoint                    */
/* -------------------------------------------------------------------------- */

export const createDelegateProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateDelegateProfileSchema.parse(input))
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
    const delegateId = formatAddress(session.user.name);
    await db
      .insert(delegateProfiles)
      .values({ ...ctx.data, delegateId })
      .onConflictDoUpdate({
        target: delegateProfiles.delegateId,
        set: { ...ctx.data },
      });
    return { success: true as const };
  });

export const createDelegateProfileMutationOptions = (
  input: z.infer<typeof CreateDelegateProfileSchema>,
) =>
  queryOptions({
    queryKey: ["createDelegateProfile", input],
    queryFn: () => createDelegateProfile({ data: input }),
  });
