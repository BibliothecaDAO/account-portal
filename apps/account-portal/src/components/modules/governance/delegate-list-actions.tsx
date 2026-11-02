import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentDelegate } from "@/hooks/governance/use-current-delegate";
import { useDelegateRealms } from "@/hooks/governance/use-delegate-realms";
import { useStarknetWallet } from "@/hooks/use-starknet-wallet";
import { formatAddress } from "@/utils/utils";
import { useAccount } from "@starknet-start/react";
import { Shuffle, TrendingDown } from "lucide-react";

import { toDelegateAddress } from "./delegate-order";
import { submitDelegation } from "./submit-delegation";

export type DelegateSortMethod = "desc" | "random";

export function DelegateListActionsView({
  sortMethod,
  onToggleSort,
  showDelegateToSelf,
  isDelegatingToSelf = false,
  onDelegateToSelf,
}: {
  sortMethod: DelegateSortMethod;
  onToggleSort?: () => void;
  showDelegateToSelf: boolean;
  isDelegatingToSelf?: boolean;
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
        <Button
          variant="outline"
          onClick={onDelegateToSelf}
          disabled={isDelegatingToSelf}
        >
          {isDelegatingToSelf ? "Delegating…" : "Delegate to self"}
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
  const { requestConnect } = useStarknetWallet();
  const { sendAsync: delegateRealms, isPending } = useDelegateRealms({
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
      isDelegatingToSelf={isPending}
      onDelegateToSelf={() =>
        void submitDelegation({
          isConnected: !!address,
          requestConnect,
          send: () => delegateRealms(),
        })
      }
    />
  );
}
