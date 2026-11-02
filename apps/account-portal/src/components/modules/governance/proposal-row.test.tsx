import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ProposalArticle } from "./proposal-detail";
import { ProposalListEmpty, ProposalListFailed } from "./proposal-list";
import { ProposalRow } from "./proposal-list-item";
import { ProposalResults } from "./proposal-results";
import { ProposalVoteButtons } from "./proposal-vote-action";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

const closed = {
  id: "p1",
  proposal_id: 41,
  max_end: 1_000,
  vote_count: 2290,
  scores_total: 3030,
  scores_1: 2400,
  scores_2: 500,
  scores_3: 130,
  metadata: { title: "RIP-41" },
  author: { id: "0x04a1" },
};

describe("ProposalRow", () => {
  it("groups the numbers and states the closed result in words", () => {
    const html = renderToStaticMarkup(<ProposalRow proposal={closed} />);

    expect(html).toContain("2,290 voters");
    expect(html).toContain("3,030 votes");
    expect(html).toContain("79% for");
  });
});

describe("proposal titles", () => {
  it("sets a title in Exo 2 sentence case in the list, never the uppercase title face", () => {
    const html = renderToStaticMarkup(<ProposalRow proposal={closed} />);

    expect(html).toMatch(/<h3 class="[^"]*font-sans[^"]*normal-case[^"]*">RIP-41</);
    expect(html).not.toContain("realm-card-title");
  });

  it("sets it the same way on the proposal's own page", () => {
    const html = renderToStaticMarkup(<ProposalArticle title="Fund the bridge audit" />);

    expect(html).toMatch(/<h1 class="[^"]*font-sans[^"]*normal-case[^"]*">Fund the bridge audit</);
    expect(html).not.toContain("realm-page-title");
  });
});

describe("ProposalResults", () => {
  it("names the choices as the vote buttons do", () => {
    const html = renderToStaticMarkup(<ProposalResults proposal={closed} />);

    expect(html).toContain("For");
    expect(html).toContain("Against");
    expect(html).toContain("Abstain");
    expect(html).not.toContain("Yes");
  });
});

describe("ProposalVoteButtons", () => {
  it("labels every choice, in the order For, Against, Abstain", () => {
    const html = renderToStaticMarkup(<ProposalVoteButtons />);

    expect(html.indexOf("For")).toBeGreaterThan(-1);
    expect(html.indexOf("For")).toBeLessThan(html.indexOf("Against"));
    expect(html.indexOf("Against")).toBeLessThan(html.indexOf("Abstain"));
  });
});

describe("proposal list states", () => {
  it("says so when there are no proposals", () => {
    expect(renderToStaticMarkup(<ProposalListEmpty />)).toContain(
      "No proposals yet.",
    );
  });

  it("says so when they could not load, and offers a retry", () => {
    const html = renderToStaticMarkup(<ProposalListFailed />);

    expect(html).toContain("Proposals could not be loaded.");
    expect(html).toContain("Try again");
  });
});
