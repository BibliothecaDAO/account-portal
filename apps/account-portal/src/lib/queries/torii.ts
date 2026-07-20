import type { TypedDocumentString } from "@/gql/eternum/graphql";
import { env } from "env";

import { executeGraphql } from "./graphql-client";

export async function executeTorii<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  return executeGraphql<TResult, TVariables>({
    endpoint: `${env.VITE_TORII_API_URL}/graphql`,
    document: query,
    variables,
  });
}
