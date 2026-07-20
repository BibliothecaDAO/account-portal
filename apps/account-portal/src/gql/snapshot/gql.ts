/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment proposalFields on Proposal {\n    id\n    proposal_id\n    space {\n      id\n      authenticators\n    }\n    author {\n      id\n    }\n    metadata {\n      title\n      body\n    }\n    max_end\n    scores_1\n    scores_2\n    scores_3\n    scores_total\n    created\n    vote_count\n  }\n": typeof types.ProposalFieldsFragmentDoc,
    "\n  query Proposal($id: String!) {\n    proposal(id: $id) {\n      ...proposalFields\n    }\n  }\n": typeof types.ProposalDocument,
    "\n  query Proposals($first: Int!, $skip: Int!, $where: Proposal_filter) {\n    proposals(\n      first: $first\n      skip: $skip\n      where: $where\n      orderBy: created\n      orderDirection: desc\n    ) {\n      ...proposalFields\n    }\n  }\n": typeof types.ProposalsDocument,
    "\n  fragment voteFields on Vote {\n    id\n    voter {\n      id\n    }\n    space {\n      id\n    }\n    metadata {\n      reason\n    }\n    proposal\n    choice\n    vp\n    created\n    tx\n  }\n": typeof types.VoteFieldsFragmentDoc,
    "\n  query UserVotes(\n    $first: Int\n    $skip: Int\n    $spaceIds: [String]\n    $voter: String\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: proposal\n      orderDirection: desc\n      where: { space_in: $spaceIds, voter: $voter }\n    ) {\n      ...voteFields\n    }\n  }\n": typeof types.UserVotesDocument,
};
const documents: Documents = {
    "\n  fragment proposalFields on Proposal {\n    id\n    proposal_id\n    space {\n      id\n      authenticators\n    }\n    author {\n      id\n    }\n    metadata {\n      title\n      body\n    }\n    max_end\n    scores_1\n    scores_2\n    scores_3\n    scores_total\n    created\n    vote_count\n  }\n": types.ProposalFieldsFragmentDoc,
    "\n  query Proposal($id: String!) {\n    proposal(id: $id) {\n      ...proposalFields\n    }\n  }\n": types.ProposalDocument,
    "\n  query Proposals($first: Int!, $skip: Int!, $where: Proposal_filter) {\n    proposals(\n      first: $first\n      skip: $skip\n      where: $where\n      orderBy: created\n      orderDirection: desc\n    ) {\n      ...proposalFields\n    }\n  }\n": types.ProposalsDocument,
    "\n  fragment voteFields on Vote {\n    id\n    voter {\n      id\n    }\n    space {\n      id\n    }\n    metadata {\n      reason\n    }\n    proposal\n    choice\n    vp\n    created\n    tx\n  }\n": types.VoteFieldsFragmentDoc,
    "\n  query UserVotes(\n    $first: Int\n    $skip: Int\n    $spaceIds: [String]\n    $voter: String\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: proposal\n      orderDirection: desc\n      where: { space_in: $spaceIds, voter: $voter }\n    ) {\n      ...voteFields\n    }\n  }\n": types.UserVotesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment proposalFields on Proposal {\n    id\n    proposal_id\n    space {\n      id\n      authenticators\n    }\n    author {\n      id\n    }\n    metadata {\n      title\n      body\n    }\n    max_end\n    scores_1\n    scores_2\n    scores_3\n    scores_total\n    created\n    vote_count\n  }\n"): typeof import('./graphql').ProposalFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Proposal($id: String!) {\n    proposal(id: $id) {\n      ...proposalFields\n    }\n  }\n"): typeof import('./graphql').ProposalDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Proposals($first: Int!, $skip: Int!, $where: Proposal_filter) {\n    proposals(\n      first: $first\n      skip: $skip\n      where: $where\n      orderBy: created\n      orderDirection: desc\n    ) {\n      ...proposalFields\n    }\n  }\n"): typeof import('./graphql').ProposalsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment voteFields on Vote {\n    id\n    voter {\n      id\n    }\n    space {\n      id\n    }\n    metadata {\n      reason\n    }\n    proposal\n    choice\n    vp\n    created\n    tx\n  }\n"): typeof import('./graphql').VoteFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserVotes(\n    $first: Int\n    $skip: Int\n    $spaceIds: [String]\n    $voter: String\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: proposal\n      orderDirection: desc\n      where: { space_in: $spaceIds, voter: $voter }\n    ) {\n      ...voteFields\n    }\n  }\n"): typeof import('./graphql').UserVotesDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
