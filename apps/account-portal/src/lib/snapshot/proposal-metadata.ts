export interface ProposalMetadata {
  title?: string;
  body?: string;
}

export function normalizeProposalMetadata(metadata: unknown): ProposalMetadata {
  if (typeof metadata !== "object" || metadata === null) return {};

  const { title, body } = metadata as Record<string, unknown>;
  return {
    ...(typeof title === "string" && title.length <= 1_000 ? { title } : {}),
    ...(typeof body === "string" && body.length <= 100_000 ? { body } : {}),
  };
}
