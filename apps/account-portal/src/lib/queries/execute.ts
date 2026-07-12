import type { TypedDocumentString } from "@/gql/snapshot/graphql";

import { executeGraphql } from "./graphql-client";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  return executeGraphql<TResult, TVariables>({
    endpoint: "https://api.snapshot.box",
    document: query,
    variables,
  });
}
