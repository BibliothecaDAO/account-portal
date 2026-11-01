import { formatUnits, parseEther } from "viem";

interface Uint256Like {
  low: bigint | number | string;
  high: bigint | number | string;
}

export function toBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "string") {
    if (value.trim() === "") return 0n;
    return BigInt(value);
  }
  if (typeof value === "number") return BigInt(value);
  if (value && typeof value === "object" && "low" in value && "high" in value) {
    const uint256 = value as Uint256Like;
    return BigInt(uint256.low) + (BigInt(uint256.high) << 128n);
  }
  return 0n;
}

function formatDecimalString(
  value: string,
  maximumFractionDigits: number,
): string {
  const [integerPartRaw, fractionPartRaw = ""] = value.split(".");
  const integerPart = integerPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (maximumFractionDigits <= 0) return integerPart;

  const fractionPart = fractionPartRaw.slice(0, maximumFractionDigits);
  const trimmedFraction = fractionPart.replace(/0+$/, "");
  if (!trimmedFraction) return integerPart;

  return `${integerPart}.${trimmedFraction}`;
}

export function formatTokenAmountDisplay(
  amount: unknown,
  {
    decimals = 18,
    maximumFractionDigits = 0,
  }: { decimals?: number; maximumFractionDigits?: number } = {},
): string {
  return formatDecimalString(
    formatUnits(toBigInt(amount), decimals),
    maximumFractionDigits,
  );
}

export function calculateSharePercent(
  userBalance: unknown,
  totalSupply: unknown,
  fractionDigits = 2,
): string {
  const user = toBigInt(userBalance);
  const total = toBigInt(totalSupply);

  if (user <= 0n || total <= 0n) {
    return (0).toFixed(fractionDigits);
  }

  const scale = 10n ** BigInt(fractionDigits);
  const scaledPercent = (user * 100n * scale) / total;
  const integerPart = scaledPercent / scale;
  const fractionPart = (scaledPercent % scale)
    .toString()
    .padStart(fractionDigits, "0");

  return `${integerPart}.${fractionPart}`;
}

export function computeTvlUsd(
  lordsInVelords: unknown,
  lordsPriceRate: unknown,
): number | undefined {
  if (lordsInVelords === undefined || lordsInVelords === null) {
    return undefined;
  }
  if (lordsPriceRate === undefined || lordsPriceRate === null) {
    return undefined;
  }

  const parsedRate =
    typeof lordsPriceRate === "string" ? Number(lordsPriceRate) : lordsPriceRate;

  if (typeof parsedRate !== "number" || Number.isNaN(parsedRate)) {
    return undefined;
  }

  const lordsAmount = Number(formatUnits(toBigInt(lordsInVelords), 18));
  if (!Number.isFinite(lordsAmount)) {
    return undefined;
  }

  return lordsAmount * parsedRate;
}

/** Staked share of a wallet's staked plus available LORDS, from 0 to 100. */
export function calculateStakedSharePercent(
  staked: number,
  available: number,
): number {
  const total = staked + available;
  if (!Number.isFinite(total) || total <= 0 || staked <= 0) return 0;
  return Math.min((staked / total) * 100, 100);
}

/** Whole percent, except that a sliver stays distinct from none and from all. */
export function formatStakedShare(sharePercent: number): string {
  if (sharePercent > 0 && sharePercent < 1) return "<1%";
  if (sharePercent > 99 && sharePercent < 100) return ">99%";
  return `${Math.round(sharePercent)}%`;
}

export const UNKNOWN_VALUE = "—";

/** `undefined` while loading, so the caller shows a skeleton; a value that never came is "—", not 0. */
export function knownOrUnknown(
  value: string | undefined,
  isLoading: boolean,
): string | undefined {
  return value ?? (isLoading ? undefined : UNKNOWN_VALUE);
}

export function formatTvlDisplay(
  tvl: number | undefined,
  isLoading: boolean,
): string | undefined {
  return knownOrUnknown(
    tvl !== undefined && Number.isFinite(tvl)
      ? `$${tvl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : undefined,
    isLoading,
  );
}

/** "Copy summary" text. An unknown figure reads "—" with no unit, never a false number. */
export function buildVelordsSummary({
  period,
  tvl,
  lordsLocked,
  rewards30d,
  apyPercent,
  date,
}: {
  period: string;
  tvl?: string;
  lordsLocked?: string;
  rewards30d?: string;
  apyPercent?: string;
  date: string;
}): string {
  const withUnit = (value: string | undefined, unit: string) =>
    value && value !== UNKNOWN_VALUE ? `${value}${unit}` : UNKNOWN_VALUE;
  return [
    `veLords Dashboard (${period})`,
    `TVL: ${tvl ?? UNKNOWN_VALUE}`,
    `Locked: ${withUnit(lordsLocked, " LORDS")}`,
    `30d Rewards: ${withUnit(rewards30d, " LORDS")}`,
    `APY: ${withUnit(apyPercent, "%")}`,
    `Updated: ${date}`,
  ].join(" | ");
}

export function parseOptionalStakeAmount(stakeAmount: string): bigint | undefined {
  const trimmedStakeAmount = stakeAmount.trim();
  if (!trimmedStakeAmount) return undefined;

  let parsedAmount: bigint;
  try {
    parsedAmount = parseEther(trimmedStakeAmount);
  } catch {
    return undefined;
  }
  if (parsedAmount <= 0n) return undefined;
  return parsedAmount;
}
