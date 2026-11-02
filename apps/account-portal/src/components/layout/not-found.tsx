import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass } from "lucide-react";

import { PageContainer } from "./page-container";
import { StatusState } from "./status-state";

/** Presentational 404 block. `onBack` defaults to browser history. */
export function NotFoundView({
  title = "Page not found",
  description = "The page you are looking for does not exist.",
  children,
  onBack = () => window.history.back(),
}: {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <StatusState
      icon={<Compass />}
      eyebrow="404"
      title={title}
      description={children ? undefined : description}
      actions={
        <>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onBack}
          >
            <ArrowLeft />
            Go back
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </>
      }
    >
      {children ? (
        <div className="text-muted-foreground text-sm">{children}</div>
      ) : null}
    </StatusState>
  );
}

export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <PageContainer width="narrow">
      <NotFoundView>{children}</NotFoundView>
    </PageContainer>
  );
}
