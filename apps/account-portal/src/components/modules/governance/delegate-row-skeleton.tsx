import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder in the row's own grid, so nothing jumps when the rows arrive. */
export function DelegateRowSkeleton() {
  return (
    <div className="delegate-row">
      <Skeleton className="size-6 rounded-full [grid-area:avatar]" />
      <Skeleton className="h-4 w-3/5 [grid-area:name]" />
      <Skeleton className="h-4 w-10 justify-self-end [grid-area:votes]" />
      <Skeleton className="h-4 w-24 [grid-area:interests]" />
      <Skeleton className="h-4 w-full [grid-area:statement]" />
      <Skeleton className="h-8 w-20 justify-self-end [grid-area:action]" />
    </div>
  );
}

export function DelegateSummarySkeleton() {
  return (
    <div className="delegate-summary">
      <Skeleton className="size-6 rounded-full [grid-area:avatar]" />
      <Skeleton className="h-4 w-3/5 [grid-area:name]" />
      <Skeleton className="h-4 w-16 justify-self-end [grid-area:votes]" />
      <Skeleton className="h-4 w-full [grid-area:statement]" />
    </div>
  );
}
