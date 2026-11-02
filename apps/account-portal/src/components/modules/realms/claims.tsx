import { runWithErrorToast } from "@/utils/run-with-error-toast";
import type { ClaimRead } from "@/lib/claim-read";
import type { ReactNode } from "react";
import LordsIcon from "@/components/icons/lords.svg?react";
import { StarknetWalletButton } from "@/components/layout/starknet-wallet-button";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useL2RealmsClaims } from "@/hooks/use-l2-realms-claims";
import { formatClaimRead, hasClaimable } from "@/lib/claim-read";
import { getRealmsLordsClaimsQueryOptions } from "@/lib/getRealmsLordsClaims";
import { formatNumber, shortenAddress } from "@/utils/utils";
import { useAccount, useExplorer } from "@starknet-start/react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { formatEther } from "viem";

const BIP_80_URL =
  "https://snapshot.box/#/sn:0x07bd3419669f9f0cc8f19e9e2457089cdd4804a4c41a5729ee9c7fd02ab8ab62/proposal/53";

export interface PastRealmsClaim {
  hash: string;
  timestamp: ReactNode;
  amount: string;
  recipient: string;
}

export interface RealmsClaimsViewProps {
  claimable: ClaimRead;
  isConnected: boolean;
  isSubmitting?: boolean;
  onClaim?: () => void;
  /** Replaces the claim button while no wallet is connected. */
  connectAction?: ReactNode;
  pastClaims: PastRealmsClaim[];
  pastClaimsState?: "ready" | "loading" | "error";
  transactionUrl: (hash: string) => string;
}

function pastClaimsMessage(
  state: RealmsClaimsViewProps["pastClaimsState"],
  isConnected: boolean,
) {
  if (state === "loading") return "Loading past claims…";
  if (state === "error") return "Past claims could not be loaded.";
  return isConnected
    ? "No past claims found."
    : "Connect your Starknet wallet to view past claims.";
}

function TransactionLink({ hash, href }: { hash: string; href: string }) {
  return (
    <a
      href={href}
      className="text-primary inline-flex min-h-6 items-center gap-1.5 font-mono text-xs underline-offset-4 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {shortenAddress(hash)}
      <ExternalLink className="size-3.5" />
    </a>
  );
}

/** Presentational Realms LORDS claims page body: claim card, BIP-80 notice and history. */
export function RealmsClaimsView({
  claimable,
  isConnected,
  isSubmitting = false,
  onClaim,
  connectAction,
  pastClaims,
  pastClaimsState = "ready",
  transactionUrl,
}: RealmsClaimsViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard
          title="Claimable LORDS"
          description="Remaining Realms emissions on Starknet."
          footer={
            !isConnected ? (
              connectAction
            ) : claimable.status === "failed" ? (
              <p className="text-muted-foreground text-sm">
                Your claimable LORDS could not be read. Reload the page to try again.
              </p>
            ) : (
              <Button
                onClick={onClaim}
                className="w-full"
                disabled={isSubmitting || !hasClaimable(claimable)}
              >
                {isSubmitting ? "Claiming…" : "Claim LORDS"}
              </Button>
            )
          }
        >
          <div className="flex items-center gap-3">
            <span className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-md">
              <LordsIcon className="size-6" />
            </span>
            <span className="realm-stat truncate text-3xl font-semibold">
              {formatClaimRead(claimable)}
            </span>
          </div>
        </SectionCard>
        <SectionCard
          title="LORDS rewards have ended"
          description="Weekly Realms emissions are no longer distributed."
        >
          <p className="text-muted-foreground text-sm">
            The Realms DAO voted to end weekly LORDS rewards in{" "}
            <a
              href={BIP_80_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              BIP-80
            </a>
            . LORDS are now directed to game rewards for Eternum seasons. Any
            balance accrued before then can still be claimed.
          </p>
        </SectionCard>
      </div>

      <SectionCard title="Past claims">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount (LORDS)</TableHead>
              <TableHead className="hidden @2xl:table-cell">Recipient</TableHead>
              <TableHead className="hidden @lg:table-cell">Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pastClaimsState !== "ready" || pastClaims.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center whitespace-normal"
                >
                  {pastClaimsMessage(pastClaimsState, isConnected)}
                </TableCell>
              </TableRow>
            ) : (
              pastClaims.map((tx) => (
                <TableRow key={tx.hash}>
                  <TableCell className="realm-stat whitespace-nowrap">
                    {tx.timestamp}
                    <span className="block @lg:hidden">
                      <TransactionLink hash={tx.hash} href={transactionUrl(tx.hash)} />
                    </span>
                  </TableCell>
                  <TableCell className="realm-stat text-right">
                    {formatNumber(Number(formatEther(BigInt(tx.amount))))}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs @2xl:table-cell">
                    {shortenAddress(tx.recipient)}
                  </TableCell>
                  <TableCell className="hidden @lg:table-cell">
                    <TransactionLink hash={tx.hash} href={transactionUrl(tx.hash)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  );
}

export const ClaimRewards = () => {
  const { address } = useAccount();
  const pastLordsClaimsQuery = useQuery(
    getRealmsLordsClaimsQueryOptions({ address }),
  );
  const { claimable, isSubmitting, claimRewards } = useL2RealmsClaims();
  const explorer = useExplorer();

  return (
    <RealmsClaimsView
      claimable={claimable}
      isConnected={!!address}
      isSubmitting={isSubmitting}
      onClaim={() => void runWithErrorToast(claimRewards, "Unable to claim rewards")}
      connectAction={
        <StarknetWalletButton label="Connect wallet to claim" />
      }
      pastClaims={pastLordsClaimsQuery.data ?? []}
      pastClaimsState={
        pastLordsClaimsQuery.isLoading
          ? "loading"
          : pastLordsClaimsQuery.isError
            ? "error"
            : "ready"
      }
      transactionUrl={(hash) => explorer.transaction(hash)}
    />
  );
};

export default ClaimRewards;
