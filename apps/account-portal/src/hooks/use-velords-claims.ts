import type { Address } from "@starknet-start/react";
import type { Call } from "starknet";
import { useMemo, useState } from "react";
import { RewardPool } from "@/abi/L2/RewardPool";
import { extractClaimableAmount } from "@/lib/velords-claim";
import { SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import {
  useAccount,
  useContract,
  useSendTransaction,
} from "@starknet-start/react";
import { validateAndParseAddress } from "starknet";

import { StakingAddresses } from "@realms-world/constants";

import { useSimulateTransactions } from "./useSimulateTransactions";

export default function useVeLordsClaims() {
  const { address } = useAccount();

  // Determine the reward pool address via chain configuration.
  const rewardPoolAddress = StakingAddresses.rewardpool[SUPPORTED_L2_CHAIN_ID];

  // Allow room to override the recipient (defaults to current account address).
  const [recipient, setRecipient] = useState<string>("");

  // Initialize the reward pool contract.
  const { contract: rewardPool } = useContract({
    abi: RewardPool,
    address: rewardPoolAddress as Address,
  });

  const parsedRecipient = useMemo(() => {
    const normalizedRecipient = recipient.trim();
    if (!normalizedRecipient) return address;
    try {
      return validateAndParseAddress(normalizedRecipient) as Address;
    } catch {
      return undefined;
    }
  }, [address, recipient]);

  // Create the call to claim rewards. If no recipient is provided, use the current account.
  const claimCall: Call[] | undefined = useMemo(() => {
    return parsedRecipient !== undefined && rewardPool
      ? [rewardPool.populate("claim", [parsedRecipient])]
      : undefined;
  }, [parsedRecipient, rewardPool]);

  // Simulate the claim rewards call to get the potential rewards amount.
  const { data: simulateData } = useSimulateTransactions({
    calls: claimCall,
  });

  const lordsClaimable = useMemo(
    () => extractClaimableAmount(simulateData),
    [simulateData],
  );

  // Prepare the function to send the claim rewards transaction.
  const { sendAsync: claimRewards, isPending: claimIsSubmitting } =
    useSendTransaction({
      calls: claimCall,
    });

  return {
    recipient,
    setRecipient,
    isRecipientValid:
      recipient.trim().length === 0 || parsedRecipient !== undefined,
    claimCall,
    lordsClaimable,
    claimRewards,
    claimIsSubmitting,
  };
}
