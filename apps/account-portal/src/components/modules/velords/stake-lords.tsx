import type { Address } from "@starknet-start/react";
import type { ReactNode } from "react";
import type { BlockNumber } from "starknet";
import { VeLords } from "@/abi/L2/VeLords";
import { StarknetWalletButton } from "@/components/layout/starknet-wallet-button";
import { SectionCard } from "@/components/ui/section-card";
import {
  calculateStakedSharePercent,
  formatStakedShare,
  UNKNOWN_VALUE,
} from "@/lib/velords-utils";
import { formatNumber, SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import {
  useAccount,
  useBalance,
  useContract,
  useReadContract,
  useSendTransaction,
} from "@starknet-start/react";
import { BlockTag } from "starknet";
import { formatEther } from "viem";

import { LORDS, StakingAddresses } from "@realms-world/constants";

import { StakeDialog } from "./stake-dialog";
import { UnlockDialog } from "./unlock-dialog";

const ARC_PATH = "M 12 100 A 88 88 0 0 1 188 100";

/** Half circle filled to `sharePercent`. It draws in a viewBox, so it scales to its box. */
function StakedArc({
  sharePercent,
  label,
  description,
}: {
  sharePercent: number;
  label: string;
  description: string;
}) {
  return (
    <div className="relative w-full max-w-56 shrink-0" role="img" aria-label={description}>
      <svg viewBox="0 0 200 108" className="block w-full" aria-hidden="true">
        <path
          d={ARC_PATH}
          fill="none"
          strokeWidth={16}
          strokeLinecap="round"
          className="stroke-border-strong"
        />
        {sharePercent > 0 ? (
          <path
            d={ARC_PATH}
            fill="none"
            strokeWidth={16}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${sharePercent} 100`}
            className="stroke-primary"
          />
        ) : null}
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="realm-stat text-3xl leading-none font-semibold">{label}</p>
        <p className="realm-label mt-1">staked</p>
      </div>
    </div>
  );
}

export interface StakeLordsViewProps {
  /** LORDS in the wallet's lock; undefined until it has been read. */
  stakedLords?: number;
  /** LORDS in the wallet; undefined until it has been read. */
  availableLords?: number;
  /** The stake and unlock buttons. */
  actions?: ReactNode;
  /** Replaces the amounts and actions while no wallet is connected. */
  connectAction?: ReactNode;
}

/** Presentational staking panel: staked share of the wallet's LORDS, amounts and actions. */
export function StakeLordsView({
  stakedLords,
  availableLords,
  actions,
  connectAction,
}: StakeLordsViewProps) {
  const isKnown = stakedLords !== undefined && availableLords !== undefined;
  const total = isKnown ? stakedLords + availableLords : undefined;
  const sharePercent = isKnown
    ? calculateStakedSharePercent(stakedLords, availableLords)
    : 0;
  const shareLabel = isKnown ? formatStakedShare(sharePercent) : UNKNOWN_VALUE;
  const amount = (value?: number) =>
    value === undefined ? UNKNOWN_VALUE : formatNumber(value);

  const rows = [
    { label: "Staked", value: stakedLords, swatch: "bg-primary" },
    { label: "Available", value: availableLords, swatch: "bg-border-strong" },
    { label: "Total", value: total },
  ];

  return (
    <SectionCard
      title="LORDS staking"
      description="Your staked and available LORDS"
    >
      {connectAction ?? (
        <div className="@container flex flex-col gap-6">
          <div className="flex flex-col items-center gap-6 @md:flex-row">
            <StakedArc
              sharePercent={sharePercent}
              label={shareLabel}
              description={
                isKnown
                  ? `${shareLabel} staked: ${amount(stakedLords)} of ${amount(total)} LORDS`
                  : "Your staked share is not known yet"
              }
            />
            <dl className="divide-border w-full min-w-0 flex-1 divide-y">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                >
                  <dt className="realm-label flex shrink-0 items-center gap-2">
                    {row.swatch ? (
                      <span
                        aria-hidden="true"
                        className={`size-2.5 rounded-full ${row.swatch}`}
                      />
                    ) : null}
                    {row.label}
                  </dt>
                  <dd className="realm-stat min-w-0 text-right text-sm font-semibold break-all">
                    {amount(row.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-wrap gap-2 [&>button]:flex-1">{actions}</div>
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              veLORDS earn a share of LORDS fees from ecosystem games and
              marketplaces. One lock per wallet.
            </p>
            <p>
              Unlocking early costs up to 75% of your locked LORDS. The maximum
              applies straight after a 4-year lock.
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export const StakeLords = () => {
  const { address } = useAccount();
  const { data } = useBalance({
    address,
    token: LORDS[SUPPORTED_L2_CHAIN_ID]?.address as Address,
    watch: true,
  });
  const veLordsAddress = StakingAddresses.velords[SUPPORTED_L2_CHAIN_ID];

  const { data: ownerLordsLock } = useReadContract({
    address: veLordsAddress as Address,
    abi: VeLords,
    functionName: "get_lock_for",
    //enabled: !!l2Address,
    watch: true,
    args: address ? [address] : undefined,
    blockIdentifier: BlockTag.PENDING as BlockNumber,
  });
  const { contract: veLordsContract } = useContract({
    abi: VeLords,
    address: veLordsAddress as Address,
  });
  const { sendAsync: manageLordsLock } = useSendTransaction({});

  const { sendAsync: withdraw } = useSendTransaction({
    calls:
      veLordsContract && address
        ? [veLordsContract.populate("withdraw", [])]
        : undefined,
  });

  const availableLords = Number(data?.formatted ?? 0);

  return (
    <StakeLordsView
      stakedLords={
        ownerLordsLock
          ? Number(formatEther(BigInt(ownerLordsLock.amount ?? 0n)))
          : undefined
      }
      availableLords={data ? availableLords : undefined}
      connectAction={
        address ? undefined : (
          <StarknetWalletButton label="Connect Wallet to Stake" />
        )
      }
      actions={
        <>
          <StakeDialog
            ownerLordsLock={ownerLordsLock}
            lordsBalance={availableLords}
            manageLordsLock={manageLordsLock}
          />
          <UnlockDialog
            ownerLordsLock={ownerLordsLock}
            lordsBalance={availableLords}
            withdraw={withdraw}
          />
        </>
      }
    />
  );
};
