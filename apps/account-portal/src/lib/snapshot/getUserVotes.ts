import type { UserVotesQueryVariables } from "@/gql/snapshot/graphql";
import { graphql } from "@/gql/snapshot";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { execute } from "../queries/execute";

const USER_VOTES_STALE_TIME_MS = 30_000;

export const VoteFieldsFragment = graphql(`
  fragment voteFields on Vote {
    id
    voter {
      id
    }
    space {
      id
    }
    metadata {
      reason
    }
    proposal
    choice
    vp
    created
    tx
  }
`);
const USER_VOTES_QUERY = graphql(`
  query UserVotes(
    $first: Int
    $skip: Int
    $spaceIds: [String]
    $voter: String
  ) {
    votes(
      first: $first
      skip: $skip
      orderBy: proposal
      orderDirection: desc
      where: { space_in: $spaceIds, voter: $voter }
    ) {
      ...voteFields
    }
  }
`);

/* -------------------------------------------------------------------------- */
/*                  loadUserVotes Server Function                           */
/* -------------------------------------------------------------------------- */

const LoadUserVotesInput = z.object({
  spaceIds: z.array(z.string().min(1).max(256)).min(1).max(10),
  voter: z.string().min(1).max(66),
  limit: z.number().int().min(1).max(100),
  skip: z.number().int().min(0).max(10_000).default(0),
});

export const getUserVotes = createServerFn({ method: "POST" })
  .validator((input: unknown) => LoadUserVotesInput.parse(input))
  .handler(async (ctx) => {
    const { spaceIds, limit, skip, voter } = ctx.data;
    const variables: UserVotesQueryVariables = {
      first: limit,
      skip,
      spaceIds,
      voter,
    };

    return execute(USER_VOTES_QUERY, variables);
  });

/* -------------------------------------------------------------------------- */
/*                   React Query Options for loadUserVotes                  */
/* -------------------------------------------------------------------------- */

export const getUserVotesQueryOptions = (
  input: z.infer<typeof LoadUserVotesInput>,
) =>
  queryOptions({
    queryKey: [
      "loadUserVotes",
      input.spaceIds,
      input.voter,
      input.limit,
      input.skip,
    ],
    queryFn: () =>
      input.voter
        ? getUserVotes({ data: input })
        : Promise.resolve({ votes: [] }),
    enabled: !!input.voter,
    staleTime: USER_VOTES_STALE_TIME_MS,
  });
