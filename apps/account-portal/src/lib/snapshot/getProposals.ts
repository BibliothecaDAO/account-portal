import { graphql } from "@/gql/snapshot";
import { SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SnapshotSpaceAddresses } from "@realms-world/constants";

import { execute } from "../queries/execute";
import { formatSnapshotProposalReference } from "./proposal-id";

const GOVERNANCE_QUERY_STALE_TIME_MS = 30_000;

graphql(`
  fragment proposalFields on Proposal {
    id
    proposal_id
    space {
      id
      authenticators
    }
    author {
      id
    }
    metadata {
      title
      body
    }
    max_end
    scores_1
    scores_2
    scores_3
    scores_total
    created
    vote_count
  }
`);
export const PROPOSAL_QUERY = graphql(`
  query Proposal($id: String!) {
    proposal(id: $id) {
      ...proposalFields
    }
  }
`);

const PROPOSALS_QUERY = graphql(`
  query Proposals($first: Int!, $skip: Int!, $where: Proposal_filter) {
    proposals(
      first: $first
      skip: $skip
      where: $where
      orderBy: created
      orderDirection: desc
    ) {
      ...proposalFields
    }
  }
`);

/* -------------------------------------------------------------------------- */
/*                  loadProposals Server Function                           */
/* -------------------------------------------------------------------------- */

const LoadProposalsInput = z.object({
  spaceIds: z.array(z.string().min(1).max(256)).min(1).max(10),
  limit: z.number().int().min(1).max(100),
  skip: z.number().int().min(0).max(10_000).default(0),
  searchQuery: z.string().trim().max(200).default(""),
});

export const getProposals = createServerFn({ method: "POST" })
  .validator((input: unknown) => LoadProposalsInput.parse(input))
  .handler(async (ctx) => {
    const { spaceIds, limit, skip, searchQuery } = ctx.data;
    const metadataFilters: Record<string, string> = {
      title_contains_nocase: searchQuery,
    };

    const variables = {
      first: limit,
      skip,
      where: {
        space_in: spaceIds,
        cancelled: false,
        metadata_: metadataFilters,
      },
    };

    return execute(PROPOSALS_QUERY, variables);
  });

/* -------------------------------------------------------------------------- */
/*                   React Query Options for loadProposals                  */
/* -------------------------------------------------------------------------- */

export const getProposalsQueryOptions = (
  input: z.infer<typeof LoadProposalsInput>,
) =>
  queryOptions({
    queryKey: [
      "loadProposals",
      input.spaceIds,
      input.limit,
      input.skip,
      input.searchQuery,
    ],
    queryFn: () => getProposals({ data: input }),
    staleTime: GOVERNANCE_QUERY_STALE_TIME_MS,
  });

/* -------------------------------------------------------------------------- */
/*                   getProposal Server Function                             */
/* -------------------------------------------------------------------------- */

const LoadProposalInput = z.object({
  id: z.string().trim().min(1).max(256),
});

export const getProposal = createServerFn({ method: "POST" })
  .validator((input: unknown) => LoadProposalInput.parse(input))
  .handler(async (ctx) => {
    const { id } = ctx.data;
    const proposalReference = formatSnapshotProposalReference(
      SnapshotSpaceAddresses[SUPPORTED_L2_CHAIN_ID] as string,
      id,
    );

    if (!proposalReference) {
      return { proposal: null };
    }

    return execute(PROPOSAL_QUERY, {
      id: proposalReference,
    });
  });

/* -------------------------------------------------------------------------- */
/*                   React Query Options for getProposal                     */
/* -------------------------------------------------------------------------- */

export const getProposalQueryOptions = (
  input: z.infer<typeof LoadProposalInput>,
) =>
  queryOptions({
    queryKey: ["loadProposal", input.id],
    queryFn: () => getProposal({ data: input }),
    staleTime: GOVERNANCE_QUERY_STALE_TIME_MS,
  });
