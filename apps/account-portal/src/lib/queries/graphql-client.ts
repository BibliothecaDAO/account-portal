import type { FetchImplementation } from "../http/request-json";
import { requestJson } from "../http/request-json";

interface GraphqlResponse<TResult> {
  data?: TResult;
  errors?: { message?: string }[];
}

interface GraphqlDocument {
  toString(): string;
}

interface ExecuteGraphqlOptions<TVariables> {
  endpoint: string;
  document: GraphqlDocument;
  variables: TVariables | undefined;
  fetchImpl?: FetchImplementation;
}

export async function executeGraphql<TResult, TVariables>({
  endpoint,
  document,
  variables,
  fetchImpl = fetch,
}: ExecuteGraphqlOptions<TVariables>): Promise<TResult> {
  const result = await requestJson<GraphqlResponse<TResult>>(endpoint, {
    fetchImpl,
    requestName: "GraphQL request",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/graphql-response+json",
    },
    body: JSON.stringify({ query: document.toString(), variables }),
  });

  if (result.errors?.length) {
    throw new Error("GraphQL request failed");
  }

  if (result.data === undefined) {
    throw new Error("GraphQL response did not include data");
  }

  return result.data;
}
