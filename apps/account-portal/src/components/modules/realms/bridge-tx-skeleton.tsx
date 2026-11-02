import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const BridgeTransactionHistorySkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading bridge history"
      className="divide-border flex flex-col divide-y"
    >
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex min-w-0 justify-between gap-2 px-2 py-4">
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <Skeleton className="h-4 w-24 max-w-full" />
            <Skeleton className="h-4 w-24 max-w-full" />
          </div>
          <div className="flex shrink-0 flex-col items-end justify-end gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BridgeTransactionHistorySkeleton;
