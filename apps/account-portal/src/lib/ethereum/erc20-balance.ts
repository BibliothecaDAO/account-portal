import { formatEther } from "viem";

export const ERC20_BALANCE_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

export function getErc20BalanceReadConfig(
  account?: `0x${string}`,
  token?: `0x${string}`,
) {
  return {
    address: token,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: account ? ([account] as const) : undefined,
    query: { enabled: Boolean(account && token) },
  } as const;
}

export function formatErc20Balance(balance: bigint | undefined): number {
  return Number(formatEther(balance ?? 0n));
}
