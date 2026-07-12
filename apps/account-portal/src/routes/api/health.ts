import { createHealthResponse } from "@/lib/health/health-response";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        createHealthResponse({
          revision: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA,
        }),
    },
  },
});
