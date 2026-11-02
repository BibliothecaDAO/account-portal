import type { RealmInventoryToken } from "@/lib/realms/get-realm-inventory";
import type { RealmInventoryViewState } from "@/lib/realms/inventory-ui";
import type { RealmOwnershipInventoryStatus } from "@realms-world/db";
import type { ReactNode } from "react";
import { OwnershipStatusAlert } from "@/components/modules/realms/ownership-status-alert";
import { RealmCard } from "@/components/modules/realms/realm-card";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel } from "lucide-react";

const GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 @lg:grid-cols-3 @2xl:grid-cols-4 @4xl:grid-cols-5";

export interface RealmsInventoryProps {
  viewState: RealmInventoryViewState;
  tokens: RealmInventoryToken[];
  status?: RealmOwnershipInventoryStatus;
  onRetry?: () => void;
}

/** Full Starknet Realm inventory grid with loading, sync/error and empty states. */
export function RealmsInventory({
  viewState,
  tokens,
  status,
  onRetry,
}: RealmsInventoryProps) {
  const isReady = viewState === "ready";

  return (
    <section aria-label="Starknet inventory" className="flex flex-col gap-3">
      {isReady ? (
        <p className="text-muted-foreground text-sm">
          {tokens.length} Realm{tokens.length === 1 ? "" : "s"} in this wallet
        </p>
      ) : null}
      {viewState === "loading" ? (
        <div className={GRID} aria-busy="true">
          {Array.from({ length: 10 }, (_, i) => (
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
          {tokens.map((realm) => (
            <RealmCard key={realm.token_id} token={realm} isGrid />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="realm-group-title">No Realms in this wallet</p>
          <p className="text-muted-foreground text-sm">
            Bridge Realms from Ethereum or pick one up on the marketplace.
          </p>
          <Button asChild variant="outline">
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
    </section>
  );
}

/** Shown in place of the inventory when no Starknet wallet is connected. */
export function RealmsConnectPrompt({ action }: { action?: ReactNode }) {
  return (
    <SectionCard title="Connect your wallet">
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Connect your Starknet wallet to view your Realms.
        </p>
        {action}
      </div>
    </SectionCard>
  );
}
