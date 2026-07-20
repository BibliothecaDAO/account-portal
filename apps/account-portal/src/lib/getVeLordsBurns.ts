import type { SQL } from "@realms-world/db";
import { StarknetAddressSchema } from "@/lib/validation/chain-address";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { and, eq, gte, lte } from "@realms-world/db";
import { db } from "@realms-world/db/client";
import { velords_rewards_received } from "@realms-world/db/schema";

/* -------------------------------------------------------------------------- */
/*                          getVelordsBurns Endpoint                          */
/* -------------------------------------------------------------------------- */

const GetVelordsBurnsInput = z.object({
  sender: StarknetAddressSchema.optional(),
  startTimestamp: z.coerce.date().optional(),
  endTimestamp: z.coerce.date().optional(),
});

export const getVelordsBurns = createServerFn({ method: "GET" })
  .validator((input: unknown) => GetVelordsBurnsInput.parse(input))
  .handler(async (ctx) => {
    const { sender, startTimestamp, endTimestamp } = ctx.data;
    const whereFilter: SQL[] = [];
    if (sender) {
      whereFilter.push(
        eq(velords_rewards_received.sender, sender.toLowerCase()),
      );
    }
    if (startTimestamp) {
      whereFilter.push(gte(velords_rewards_received.timestamp, startTimestamp));
    }
    if (endTimestamp) {
      whereFilter.push(lte(velords_rewards_received.timestamp, endTimestamp));
    }
    return db.query.velords_rewards_received.findMany({
      where: and(...whereFilter),
    });
  });

export const getVelordsBurnsQueryOptions = (
  input?: z.infer<typeof GetVelordsBurnsInput>,
) =>
  queryOptions({
    queryKey: ["getVelordsBurns", input],
    queryFn: () => getVelordsBurns({ data: input ?? {} }),
  });
