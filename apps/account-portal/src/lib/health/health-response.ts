export function createHealthResponse({
  now = new Date(),
  revision = "unknown",
}: {
  now?: Date;
  revision?: string;
} = {}): Response {
  return Response.json(
    {
      status: "ok",
      timestamp: now.toISOString(),
      revision,
    },
    {
      status: 200,
      headers: { "cache-control": "no-store" },
    },
  );
}
