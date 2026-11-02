import type { BlockNumber, Call } from "starknet";
import { useCallback, useMemo } from "react";
import { RealmsABI } from "@/abi/L2/Realms";
import { toClaimRead } from "@/lib/claim-read";
import { SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import {
  useAccount,
  useContract,
  useReadContract,
  useSendTransaction,
} from "@starknet-start/react";
import { BlockTag } from "starknet";
import { formatEther } from "viem";

import { CollectionAddresses } from "@realms-world/constants";

import { useToast } from "./use-toast";

export const useL2RealmsClaims = () => {
  const { toast } = useToast();
  const { address: l2Address } = useAccount();
  const l2RealmsAddress = CollectionAddresses.realms[
    SUPPORTED_L2_CHAIN_ID
  ] as `0x${string}`;

  const { data: balance, isError, isLoading } = useReadContract({
    address: l2RealmsAddress,
    abi: RealmsABI,
    functionName: "get_reward_balance_for",
    enabled: !!l2Address,
    watch: true,
    args: l2Address ? [l2Address] : undefined,
    blockIdentifier: BlockTag.PENDING as BlockNumber,
  });

  const { contract } = useContract({
    abi: RealmsABI,
    address: l2RealmsAddress,
  });

  const calls: Call[] = useMemo(() => {
    if (!l2Address || !contract) return [];
    return [contract.populate("reward_claim", [])];
  }, [l2Address, contract]);

  const {
    sendAsync,
    data: claimHash,
    isPending: isSubmitting,
  } = useSendTransaction({ calls });

  const claimRewards = useCallback(async () => {
    const tx = await sendAsync();
    if (tx.transaction_hash) {
      const claimAmount = typeof balance === "bigint" ? formatEther(balance) : "0";
      toast({
        title: "Realms' Lords Claim Submitted",
        description: `Claim of ${claimAmount} Lords in progress`,
      });
    }
    return tx;
  }, [sendAsync, toast, balance]);

  const claimable = toClaimRead(balance, isError, isLoading);

  return {
    claimable,
    calls,
    isSubmitting,
    claimRewards,
    claimHash,
  };
};
