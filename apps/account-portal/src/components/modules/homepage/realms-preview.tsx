import type { RealmInventoryToken } from "@/lib/realms/get-realm-inventory";
import type { RealmInventoryViewState } from "@/lib/realms/inventory-ui";
import type { RealmOwnershipInventoryStatus } from "@realms-world/db";
import { OwnershipStatusAlert } from "@/components/modules/realms/ownership-status-alert";
import { RealmCard } from "@/components/modules/realms/realm-card";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Gavel, Plus } from "lucide-react";

/** Max realm cards shown on the dashboard before "View all". */
export const REALMS_PREVIEW_COUNT = 5;

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 @4xl:grid-cols-6";

export interface RealmsPreviewProps {
  viewState: RealmInventoryViewState;
  tokens: RealmInventoryToken[];
  status?: RealmOwnershipInventoryStatus;
  onRetry?: () => void;
}

export function RealmsPreview({
  viewState,
  tokens,
  status,
  onRetry,
}: RealmsPreviewProps) {
  const overflow = tokens.length - REALMS_PREVIEW_COUNT;
  const isReady = viewState === "ready";

  return (
    <SectionCard
      title="Your Realms"
      description={
        isReady && tokens.length > 0
          ? `${tokens.length} Realm${tokens.length === 1 ? "" : "s"} on Starknet`
          : undefined
      }
      action={
        isReady && overflow > 0 ? (
          <Button asChild variant="outline" size="sm">
            <Link to="/realms">View all</Link>
          </Button>
        ) : undefined
      }
    >
      {viewState === "loading" ? (
        <div className={GRID}>
          {Array.from({ length: REALMS_PREVIEW_COUNT }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : !isReady ? (
        <OwnershipStatusAlert
          status={status}
          isError={viewState === "error"}
          onRetry={onRetry}
        />
      ) : tokens.length > 0 ? (
        <div className={GRID}>
          {tokens.slice(0, REALMS_PREVIEW_COUNT).map((realm) => (
            <RealmCard key={realm.token_id} token={realm} isGrid borderless />
          ))}
          {overflow > 0 && (
            <Link
              to="/realms"
              className="realm-interactive-row text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-2 rounded-lg p-4 text-sm"
            >
              <Plus className="size-6" />
              {overflow} more
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="realm-group-title">No Realms in this wallet</p>
          <p className="text-muted-foreground text-sm">
            Visit the marketplace to acquire your first Realm.
          </p>
          <Button asChild>
            <a
              href="https://market.realms.world"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Gavel />
              Browse marketplace
            </a>
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
