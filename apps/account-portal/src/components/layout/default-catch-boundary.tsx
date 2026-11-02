import type { ErrorComponentProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Home, RotateCcw, TriangleAlert } from "lucide-react";

import { PageContainer } from "./page-container";
import { StatusState } from "./status-state";

/** Presentational error block: details slot, retry and a home/back action. */
export function ErrorStateView({
  details,
  isRoot,
  onRetry,
  onBack,
}: {
  details?: ReactNode;
  isRoot?: boolean;
  onRetry: () => void;
  onBack?: () => void;
}) {
  return (
    <StatusState
      icon={<TriangleAlert />}
      eyebrow="Error"
      title="Something went wrong"
      description="An unexpected error occurred while loading this page."
      actions={
        <>
          <Button className="w-full sm:w-auto" onClick={onRetry}>
            <RotateCcw />
            Try again
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            {isRoot ? (
              <Link to="/">
                <Home />
                Home
              </Link>
            ) : (
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  (onBack ?? (() => window.history.back()))();
                }}
              >
                <ArrowLeft />
                Go back
              </Link>
            )}
          </Button>
        </>
      }
    >
      {details ? (
        <div
          tabIndex={0}
          className="bg-muted/40 border-border text-muted-foreground max-h-64 overflow-auto rounded-md border p-3 text-left text-xs break-words"
        >
          {details}
        </div>
      ) : null}
    </StatusState>
  );
}

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  return (
    <PageContainer width="narrow" className="flex-1 justify-center">
      <ErrorStateView
        details={import.meta.env.DEV ? <ErrorComponent error={error} /> : undefined}
        isRoot={isRoot}
        onRetry={async () => {
          await router.invalidate();
        }}
      />
    </PageContainer>
  );
}
