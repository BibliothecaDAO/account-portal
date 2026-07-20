import { describe, expect, it, vi } from "vitest";

import { executeGraphql } from "./graphql-client";

describe("executeGraphql", () => {
  it("rejects GraphQL errors returned with a successful HTTP status", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            errors: [{ message: "upstream resolver failed" }],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    await expect(
      executeGraphql<{ proposals: unknown[] }, { first: number }>({
        endpoint: "https://snapshot.example/graphql",
        document: "query Proposals($first: Int!) { proposals(first: $first) }",
        variables: { first: 20 },
        fetchImpl,
      }),
    ).rejects.toThrow("GraphQL request failed");
  });

  it("reports an upstream HTTP failure without parsing its body as GraphQL", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(new Response("service unavailable", { status: 503 })),
    );

    await expect(
      executeGraphql<unknown, Record<string, never>>({
        endpoint: "https://snapshot.example/graphql",
        document: "query Health { health }",
        variables: {},
        fetchImpl,
      }),
    ).rejects.toThrow("GraphQL request failed with HTTP 503");
  });

  it("rejects a successful response that omits GraphQL data", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      executeGraphql<unknown, Record<string, never>>({
        endpoint: "https://snapshot.example/graphql",
        document: "query Health { health }",
        variables: {},
        fetchImpl,
      }),
    ).rejects.toThrow("GraphQL response did not include data");
  });
});
