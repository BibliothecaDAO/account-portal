import type {
  BridgeHistoryStatus,
  BridgeHistoryTransaction,
} from "@/lib/bridge-history";
import { StarknetMessaging as STARKNET_MESSAGING_ABI } from "@/abi/L1/StarknetMessaging";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWriteFinalizeWithdrawRealms } from "@/hooks/bridge/useWriteFinalizeWithdrawRealms";
import { useToast } from "@/hooks/use-toast";
import { getBridgeEventExplorer } from "@/lib/bridge-history";
import { getBridgeWithdrawalMessage } from "@/lib/bridge-withdrawal";
import { getBridgeTransactionsQueryOptions } from "@/lib/getBridgeTransactions";
import { cn, shortenAddress } from "@/utils/utils";
import { useAccount } from "@starknet-start/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useAccount as useL1Account, useReadContract } from "wagmi";

import { getBridgeNetworkConfig } from "@realms-world/bridge";

import { TransactionChains } from "./bridge-tx-chains";

const CLAIMABILITY_POLL_INTERVAL_MS = 10_000;

function CompleteWithdrawalAction({
  transaction,
  network,
  historyStatus,
  hasCurrentHistory,
  isWithdrawPending,
  onComplete,
}: {
  transaction: BridgeHistoryTransaction;
  network: "mainnet" | "sepolia";
  historyStatus: BridgeHistoryStatus;
  hasCurrentHistory: boolean;
  isWithdrawPending: boolean;
  onComplete: (transaction: BridgeHistoryTransaction) => Promise<void>;
}) {
  const message = getBridgeWithdrawalMessage(network, {
    reqHash: transaction.req_hash,
    ownerL1: transaction.owner_l1,
    ownerL2: transaction.owner_l2,
    tokenIds: transaction.token_ids,
  });
  const indexedAvailable = transaction.events.some(
    (event) => event.type === "withdraw_available_l1",
  );
  const { data: messageCount } = useReadContract({
    address: message.route.messagingAddress,
    abi: STARKNET_MESSAGING_ABI,
    functionName: "l2ToL1Messages",
    args: [message.messageHash],
    chainId: message.route.l1ChainId,
    query: {
      refetchInterval: CLAIMABILITY_POLL_INTERVAL_MS,
      refetchIntervalInBackground: false,
    },
  });
  const hasOnchainResult = typeof messageCount === "bigint";
  const isClaimable = hasOnchainResult
    ? messageCount > 0n
    : indexedAvailable &&
      hasCurrentHistory &&
      (historyStatus === "ready" || historyStatus === "legacy");

  return isClaimable ? (
    <Button
      size="sm"
      variant="outline"
      onClick={async (event) => {
        event.stopPropagation();
        await onComplete(transaction);
      }}
      className="border-success z-20 mt-2 rounded"
      disabled={isWithdrawPending}
    >
      Complete Withdraw
    </Button>
  ) : (
    <span className="text-muted-foreground">In Progress</span>
  );
}

const BridgeTransactionItems = () => {
  const { writeAsync, isPending: isWithdrawPending } =
    useWriteFinalizeWithdrawRealms();

  const { address: l1Address } = useL1Account();
  const { address: l2Address } = useAccount();
  const { toast } = useToast();

  const bridgeTxsQuery = useSuspenseQuery(
    getBridgeTransactionsQueryOptions({
      l1Account: l1Address?.toLowerCase(),
      l2Account: l2Address,
    }),
  );
  const history = bridgeTxsQuery.data;
  const transactions = history?.transactions;
  const l2ChainId = history
    ? getBridgeNetworkConfig(history.network).l2ChainId
    : null;
  const hasCurrentHistory =
    !bridgeTxsQuery.isRefetchError &&
    Date.now() - bridgeTxsQuery.dataUpdatedAt <= 60_000;
  const statusMessage = bridgeTxsQuery.isRefetchError
    ? "Bridge history could not be refreshed. Claim availability is still checked on Ethereum."
    : history?.status === "syncing"
      ? "Bridge history is syncing. Claim availability is checked on Ethereum."
      : history?.status === "stale"
        ? "Bridge history is delayed. Claim availability is checked on Ethereum."
        : history?.status === "unavailable"
          ? "Bridge history is temporarily unavailable. Claim availability is still checked on Ethereum."
          : history?.status === "legacy"
            ? "Bridge history may be delayed. Check the linked transactions for the latest status."
            : null;

  const handleCompleteWithdraw = async (
    transaction: BridgeHistoryTransaction,
  ) => {
    const hash = await writeAsync({
      hash: transaction.req_hash,
      l1Address: transaction.owner_l1,
      l2Address: transaction.owner_l2,
      tokenIds: transaction.token_ids.map((id) => BigInt(id)),
    });
    if (hash) {
      toast({
        title: "Withdraw completed",
        description: `Realms withdrawn to your Ethereum account at ${hash}`,
      });
    }
  };
  return (
    <div>
      {statusMessage && (
        <p role="status" className="text-muted-foreground mb-3 text-sm">
          {statusMessage}
        </p>
      )}
      <Accordion type="single" collapsible>
        {transactions?.map((transaction) => {
          const isCompleted = transaction.events.some(
            (event) =>
              event.type === "withdraw_completed_l1" ||
              event.type === "withdraw_completed_l2",
          );

          return (
            <AccordionItem key={transaction.id} value={transaction.id}>
              <AccordionTrigger className="flex w-full items-center justify-between hover:no-underline">
                <div className="flex w-full min-w-0 justify-between gap-2 px-2">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <TransactionChains fromChain={transaction.from_chain} />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {transaction.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-end">
                    <div className="flex flex-wrap justify-end gap-1">
                      {transaction.token_ids.slice(0, 3).map((id) => (
                        <Badge variant="outline" className="w-fit" key={id}>
                          #{id}
                        </Badge>
                      ))}
                      {transaction.token_ids.length > 3 && (
                        <Badge key="more">
                          +{transaction.token_ids.length - 3}
                        </Badge>
                      )}
                    </div>
                    {isCompleted ? (
                      <span className="text-muted-foreground">Completed</span>
                    ) : transaction.from_chain === l2ChainId ? (
                      <CompleteWithdrawalAction
                        transaction={transaction}
                        network={history?.network ?? "mainnet"}
                        historyStatus={history?.status ?? "unavailable"}
                        hasCurrentHistory={hasCurrentHistory}
                        isWithdrawPending={isWithdrawPending}
                        onComplete={handleCompleteWithdraw}
                      />
                    ) : (
                      <span className="text-muted-foreground">In Progress</span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-1 py-2">
                  <span
                    className={cn(
                      isCompleted ? "text-success" : "text-warning",
                    )}
                  >
                    {isCompleted ? "Completed" : "In Progress"}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 break-all">
                    {shortenAddress(transaction.from_address)}
                    <ArrowRight />
                    {shortenAddress(transaction.to_address)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {transaction.events.map((event) => {
                      const explorer = getBridgeEventExplorer(
                        history?.network ?? "mainnet",
                        event.source_chain,
                        event.hash,
                      );
                      return (
                        <a
                          key={event.id}
                          href={explorer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline">{explorer.name}</Button>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default BridgeTransactionItems;
