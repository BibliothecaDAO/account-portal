import type { DelegateRowData } from "@/components/modules/governance/delegate-row";
import { DelegateSummary } from "@/components/modules/governance/delegate-row";
import { DelegateSummarySkeleton } from "@/components/modules/governance/delegate-row-skeleton";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Link } from "@tanstack/react-router";
import { Vote } from "lucide-react";

/** Empty governance state shown when the wallet has not delegated its Realms. */
export function NoDelegateCard() {
  return (
    <SectionCard
      title="Governance"
      description="Delegate your Realms to take part in DAO votes."
      className="h-full"
      contentClassName="flex flex-col items-center justify-center gap-3 py-6 text-center"
    >
      <span className="bg-muted text-primary flex size-10 items-center justify-center rounded-full">
        <Vote className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="realm-group-title">No delegate selected</p>
        <p className="text-muted-foreground text-sm">
          Choose a delegate or delegate to yourself to vote.
        </p>
      </div>
      <Button asChild className="w-full sm:w-auto">
        <Link to="/delegate/list">Choose a delegate</Link>
      </Button>
    </SectionCard>
  );
}

/** Shown when the delegate could not be read, so a failed read never looks like no delegate. */
export function DelegateReadErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <SectionCard
      title="Governance"
      className="h-full"
      contentClassName="flex flex-col items-center justify-center gap-3 py-6 text-center"
    >
      <p className="text-muted-foreground text-sm">
        Couldn&apos;t read your delegate.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </SectionCard>
  );
}

function ChangeDelegateLink() {
  return (
    <Link
      to="/delegate/list"
      className="text-primary inline-flex min-h-6 items-center text-sm underline underline-offset-4"
    >
      Change delegate
    </Link>
  );
}

/** The wallet's delegate, or a placeholder in the same shape while it loads. */
export function CurrentDelegatePanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionCard title="Your delegate" action={<ChangeDelegateLink />} className="h-full">
      {children}
    </SectionCard>
  );
}

export function CurrentDelegateCard({
  delegate,
}: {
  delegate: DelegateRowData;
}) {
  return (
    <CurrentDelegatePanel>
      <DelegateSummary delegate={delegate} />
    </CurrentDelegatePanel>
  );
}

export function CurrentDelegateSkeleton() {
  return (
    <CurrentDelegatePanel>
      <DelegateSummarySkeleton />
    </CurrentDelegatePanel>
  );
}
