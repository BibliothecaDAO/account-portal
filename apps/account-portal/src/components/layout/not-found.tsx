import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <div className="space-y-2 p-2">
      <div className="text-muted-foreground">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="bg-primary text-primary-foreground rounded px-2 py-1 text-sm font-black uppercase"
        >
          Go back
        </button>
        <Link
          to="/"
          className="bg-secondary text-secondary-foreground rounded px-2 py-1 text-sm font-black uppercase"
        >
          Start Over
        </Link>
      </p>
    </div>
  );
}
