interface DelegateListItem {
  delegatedVotes: string | null;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * One page from two sources, each fetched up to limit + 1. Rows arrive best-first and
 * profiles have 0 or unknown votes, so in "desc" profiles follow the rows and never
 * displace a delegate with votes. The limit applies to the merged list, and whatever
 * falls off sets `nextCursor`, so a page is never over limit.
 */
export function mergeDelegateList<T extends DelegateListItem>(
  rows: T[],
  profiles: T[],
  {
    limit,
    orderBy,
    random = Math.random,
  }: { limit: number; orderBy: "desc" | "random"; random?: () => number },
) {
  const merged =
    orderBy === "desc"
      ? [...rows, ...profiles]
      : shuffle([...rows, ...profiles], random);
  const next = merged[limit];
  return {
    items: merged.slice(0, limit),
    nextCursor: next ? parseInt(next.delegatedVotes ?? "0") : undefined,
  };
}
