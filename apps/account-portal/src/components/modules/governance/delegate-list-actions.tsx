import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentDelegate } from "@/hooks/governance/use-current-delegate";
import { useDelegateRealms } from "@/hooks/governance/use-delegate-realms";
import { formatAddress } from "@/utils/utils";
import { useAccount } from "@starknet-start/react";
import { Shuffle, TrendingDown } from "lucide-react";

import { toDelegateAddress } from "./delegate-order";

export type DelegateSortMethod = "desc" | "random";

export function DelegateListActionsView({
  sortMethod,
  onToggleSort,
  showDelegateToSelf,
  onDelegateToSelf,
}: {
  sortMethod: DelegateSortMethod;
  onToggleSort?: () => void;
  showDelegateToSelf: boolean;
  onDelegateToSelf?: () => void;
}) {
  return (
    <>
      <Button variant="outline" onClick={onToggleSort}>
        {sortMethod === "desc" ? (
          <>
            <TrendingDown />
            Sort: Most votes
          </>
        ) : (
          <>
            <Shuffle />
            Sort: Random
          </>
        )}
      </Button>
      {showDelegateToSelf ? (
        <Button variant="outline" onClick={onDelegateToSelf}>
          Delegate to self
        </Button>
      ) : null}
    </>
  );
}

export interface DelegateListActionsProps {
  onSortChange?: (sortMethod: DelegateSortMethod) => void;
}

export function DelegateListActions({
  onSortChange,
}: DelegateListActionsProps) {
  const { address } = useAccount();
  const { sendAsync: delegateRealms } = useDelegateRealms({
    delegatee: address,
  });
  const { data: currentDelegate } = useCurrentDelegate();

  const [sortMethod, setSortMethod] = useState<DelegateSortMethod>("random");

  const toggleSortMethod = () => {
    setSortMethod((prevMethod) => {
      const newMethod = prevMethod === "desc" ? "random" : "desc";
      if (onSortChange) {
        onSortChange(newMethod);
      }
      return newMethod;
    });
  };

  return (
    <DelegateListActionsView
      sortMethod={sortMethod}
      onToggleSort={toggleSortMethod}
      showDelegateToSelf={
        !!address && toDelegateAddress(currentDelegate) !== formatAddress(address)
      }
      onDelegateToSelf={() => void delegateRealms()}
    />
  );
}
