import type { ReactNode } from "react";
import { Children } from "react";
import { useCurrentDelegate } from "@/hooks/governance/use-current-delegate";
import {
  getDelegateByIDQueryOptions,
  getDelegatesQueryOptions,
} from "@/lib/getDelegates";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { placeCurrentDelegateFirst, toDelegateAddress } from "./delegate-order";
import { DelegateRow } from "./delegate-row";

/** One panel of rows, shared by the delegate list, its skeleton and stories. */
export function DelegatePanel({
  children,
  isLoading = false,
}: {
  children: ReactNode;
  isLoading?: boolean;
}) {
  return (
    <section
      aria-label="Delegates"
      aria-busy={isLoading || undefined}
      className="@container/delegates bg-card border-border rounded-lg border"
    >
      <div className="delegate-row-head" aria-hidden="true">
        <span className="[grid-column:1/3]">Delegate</span>
        <span className="text-right">Votes</span>
        <span>Interests</span>
        <span>Statement</span>
      </div>
      <ul className="divide-border divide-y">
        {Children.map(children, (row) => (
          <li>{row}</li>
        ))}
      </ul>
    </section>
  );
}

export function DelegateListEmpty({ searchQuery }: { searchQuery?: string }) {
  return (
    <div className="bg-card border-border text-muted-foreground rounded-lg border px-4 py-8 text-center text-sm">
      <p className="realm-group-title">No delegates found</p>
      {searchQuery ? <p>Nothing matches “{searchQuery}”.</p> : null}
    </div>
  );
}

function DelegateList({
  searchQuery,
  sortMethod,
}: {
  sortMethod: "desc" | "random";
  searchQuery: string;
}) {
  const delegatesQuery = useSuspenseQuery(
    getDelegatesQueryOptions({
      limit: 200,
      cursor: 0,
      search: searchQuery.toLowerCase(),
      orderBy: sortMethod,
    }),
  );
  const { data: currentDelegate } = useCurrentDelegate();
  const currentAddress = toDelegateAddress(currentDelegate);
  const { data: currentRecord } = useQuery(
    getDelegateByIDQueryOptions({ address: currentAddress }),
  );

  const items = placeCurrentDelegateFirst(
    delegatesQuery.data.items,
    currentAddress,
    // A search shows only what it matched.
    searchQuery ? undefined : currentRecord,
  );
  if (items.length === 0) {
    return <DelegateListEmpty searchQuery={searchQuery} />;
  }
  return (
    <DelegatePanel>
      {items.map((delegate) => (
        <DelegateRow
          key={delegate.id}
          delegate={delegate}
          isCurrentDelegate={delegate.user === currentAddress}
        />
      ))}
    </DelegatePanel>
  );
}

export default DelegateList;
