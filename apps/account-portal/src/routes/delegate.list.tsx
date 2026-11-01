import { Suspense, useDeferredValue, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DelegateCardSkeleton } from "@/components/modules/governance/delegate-card-skeleton";
import DelegateList, {
  DelegateGrid,
} from "@/components/modules/governance/delegate-list";
import { DelegateListActions } from "@/components/modules/governance/delegate-list-actions";
import { Input } from "@/components/ui/input";
import { getDelegatesQueryOptions } from "@/lib/getDelegates";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

export const Route = createFileRoute("/delegate/list")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      getDelegatesQueryOptions({
        limit: 200,
        cursor: 0,
        search: "",
        orderBy: "random",
      }),
    );
  },
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortMethod, setSortMethod] = useState<"desc" | "random">("random");

  return (
    <PageContainer className="min-w-0">
      <PageHeader
        title="Delegates"
        description="Choose who votes with your Realms in the DAO, or delegate to yourself."
      />
      <div className="bg-card/85 border-border z-10 flex flex-col gap-3 rounded-lg border p-3 backdrop-blur-sm sm:sticky sm:top-(--header-height) sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            className="pl-9"
            placeholder="Search delegates..."
            aria-label="Search delegates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DelegateListActions onSortChange={setSortMethod} />
      </div>
      <Suspense
        fallback={
          <DelegateGrid>
            {Array.from({ length: 6 }).map((_, index) => (
              <DelegateCardSkeleton key={index} />
            ))}
          </DelegateGrid>
        }
      >
        <DelegateList
          searchQuery={deferredSearchQuery}
          sortMethod={sortMethod}
        />
      </Suspense>
    </PageContainer>
  );
}
