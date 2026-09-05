import { ProposalDocument, ProposalsDocument } from "@/gql/snapshot/graphql";
import { afterEach, describe, expect, it, vi } from "vitest";

import { execute } from "../queries/execute";

const spaceId =
  "0x07bd3419669f9f0cc8f19e9e2457089cdd4804a4c41a5729ee9c7fd02ab8ab62";
const proposal = {
  id: `${spaceId}/82`,
  proposal_id: "82",
  metadata: { title: "BIP-92: Ecosystem Team Term Jan–Jun 2026" },
};

// Snapshot rejects this removed field with HTTP 400, which previously caused
// both route loaders to throw "Network response was not ok".
function mockSnapshot(data: unknown) {
  const fetchMock = vi.fn((_url: string, init: RequestInit) => {
    const { query } = JSON.parse(init.body as string) as { query: string };
    if (/\bexecution_ready\b/.test(query)) {
      return Promise.resolve(
        Response.json(
          {
            errors: [
              {
                message:
                  'Cannot query field "execution_ready" on type "Proposal".',
              },
            ],
          },
          { status: 400 },
        ),
      );
    }
    return Promise.resolve(Response.json({ data }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("Snapshot proposal queries", () => {
  it("loads the latest proposals using the generated query and existing space filter", async () => {
    const fetchMock = mockSnapshot({ proposals: [proposal] });
    const variables = {
      first: 20,
      skip: 0,
      where: {
        space_in: [spaceId],
        cancelled: false,
        metadata_: { title_contains_nocase: "" },
      },
    };

    await expect(execute(ProposalsDocument, variables)).resolves.toEqual({
      proposals: [proposal],
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.snapshot.box");
    expect(init.method).toBe("POST");
    const request = JSON.parse(init.body as string) as {
      query: string;
      variables: unknown;
    };
    expect(request.variables).toEqual(variables);
    expect(request.query).toMatch(/orderBy: created\s+orderDirection: desc/);
  });

  it("loads individual proposals using the same compatible generated fragment", async () => {
    mockSnapshot({ proposal });

    await expect(
      execute(ProposalDocument, { id: proposal.id }),
    ).resolves.toEqual({ proposal });
  });
});
