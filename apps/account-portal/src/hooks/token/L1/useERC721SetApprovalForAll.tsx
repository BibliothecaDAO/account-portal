import type { Hash } from "viem";
import { useCallback } from "react";
import { ERC721_ABI } from "@/abi/L1/ERC721";
import { useWriteContract } from "wagmi";

const FUNCTION = "setApprovalForAll";

export function useERC721SetApprovalForAll({
  onSuccess,
}: {
  onSuccess?: (data: Hash) => void;
}) {
  const { writeContractAsync, error, ...writeReturn } = useWriteContract({
    mutation: { onSuccess: (data) => onSuccess?.(data) },
  });

  const writeAsync = useCallback(
    async ({
      contractAddress,
      operator,
    }: {
      contractAddress: `0x${string}`;
      operator: `0x${string}`;
    }) => {
      return await writeContractAsync({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: FUNCTION,
        args: [operator, true],
      });
    },
    [writeContractAsync],
  );
  return { writeAsync, error, ...writeReturn };
}
