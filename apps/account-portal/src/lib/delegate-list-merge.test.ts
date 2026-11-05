import { describe, expect, it } from "vitest";

import { mergeDelegateList } from "./delegate-list-merge";

const item = (id: string, delegatedVotes: string | null) => ({
  id,
  delegatedVotes,
});

describe("mergeDelegateList", () => {
  it("sorts delegates with votes ahead of profiles with unknown votes", () => {
    const { items, nextCursor } = mergeDelegateList(
      [item("a", "9"), item("b", "0")],
      [item("p", null)],
      { limit: 10, orderBy: "desc" },
    );
    expect(items.map((i) => i.id)).toEqual(["a", "b", "p"]);
    expect(nextCursor).toBeUndefined();
  });

  it("applies the limit to the merged list, not to each source", () => {
    const { items, nextCursor } = mergeDelegateList(
      [item("a", "9"), item("b", "5"), item("c", "3")],
      [item("p", null)],
      { limit: 2, orderBy: "desc" },
    );
    expect(items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(nextCursor).toBe(3);
  });

  it("does not turn an unknown next item into NaN", () => {
    const { items, nextCursor } = mergeDelegateList(
      [item("a", "9")],
      [item("p", null)],
      { limit: 1, orderBy: "desc" },
    );
    expect(items).toHaveLength(1);
    expect(nextCursor).toBe(0);
  });

  it("mixes profiles through a random order and still respects the limit", () => {
    const rows = [item("a", "9"), item("b", "5")];
    const profiles = [item("p", null)];
    const { items } = mergeDelegateList(rows, profiles, {
      limit: 3,
      orderBy: "random",
      random: () => 0,
    });
    expect(items.map((i) => i.id).sort()).toEqual(["a", "b", "p"]);
    expect(items[2]?.id).toBe("a");
    expect(
      mergeDelegateList(rows, profiles, {
        limit: 2,
        orderBy: "random",
        random: () => 0,
      }).items,
    ).toHaveLength(2);
  });
});
