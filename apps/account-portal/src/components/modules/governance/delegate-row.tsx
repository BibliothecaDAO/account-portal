import type { ReactNode } from "react";
import { useId, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDelegateRealms } from "@/hooks/governance/use-delegate-realms";
import { useStarkDisplayName } from "@/hooks/use-stark-name";
import { toast } from "@/hooks/use-toast";
import { cn, formatNumber, shortenAddress } from "@/utils/utils";

export interface DelegateRowData {
  user: string;
  delegateProfile?: {
    twitter?: string | null;
    github?: string | null;
    telegram?: string | null;
    discord?: string | null;
    interests?: string[] | null;
    statement?: string | null;
  } | null;
  delegatedVotes: string;
  id: string;
}

/** Interests shown in the row; the rest open through "More". */
const ROW_INTERESTS = 2;

function InterestChips({ interests }: { interests: string[] }) {
  return interests.map((interest, index) => (
    <Badge key={index} variant="outline" className="text-muted-foreground">
      {interest}
    </Badge>
  ));
}

function DelegateAvatar({ user, label }: { user: string; label: string }) {
  return (
    <Avatar className="border-border [grid-area:avatar] size-6 border">
      <AvatarImage
        alt=""
        src={`https://cdn.stamp.fyi/avatar/${user}?s=48`}
      />
      <AvatarFallback className="realm-chip">{label.slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
}

/** A .stark name reads in Exo 2; an address reads as lowercase mono, so its zero stays a zero. */
function DelegateName({ user, name }: { user: string; name?: string }) {
  const address = shortenAddress(user);
  const isNamed = !!name && name !== address;
  const label = isNamed ? name : address;
  return (
    <span
      title={label}
      className={cn(
        "min-w-0 truncate [grid-area:name]",
        isNamed ? "font-sans font-semibold" : "realm-stat text-sm lowercase",
      )}
    >
      {label}
    </span>
  );
}

function DelegateVotes({ votes, unit }: { votes: string; unit?: ReactNode }) {
  return (
    <span className="realm-stat text-right text-sm whitespace-nowrap [grid-area:votes]">
      {formatNumber(Number(votes), 0)}
      {unit}
    </span>
  );
}

/** Presentational delegate row: comparable columns, with the rest behind "More". */
export function DelegateRowView({
  delegate,
  name,
  isCurrentDelegate = false,
  onDelegate,
}: {
  delegate: DelegateRowData;
  name?: string;
  isCurrentDelegate?: boolean;
  onDelegate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const detailId = useId();
  const label = name || shortenAddress(delegate.user);
  const interests = delegate.delegateProfile?.interests ?? [];
  const statement = delegate.delegateProfile?.statement;
  const hiddenInterests = interests.length - ROW_INTERESTS;

  return (
    <div className="delegate-row" data-current={isCurrentDelegate || undefined}>
      <DelegateAvatar user={delegate.user} label={label} />
      <DelegateName user={delegate.user} name={name} />
      <DelegateVotes
        votes={delegate.delegatedVotes}
        unit={
          <span className="text-muted-foreground ml-1 font-sans text-xs @[45rem]/delegates:hidden">
            votes
          </span>
        }
      />
      <div className="flex min-w-0 flex-wrap items-center gap-1 [grid-area:interests]">
        <InterestChips interests={interests.slice(0, ROW_INTERESTS)} />
        {hiddenInterests > 0 ? (
          <span className="realm-chip text-muted-foreground">
            +{hiddenInterests}
          </span>
        ) : null}
      </div>
      <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm [grid-area:statement]">
        <span className="min-w-0 flex-1 truncate">
          {statement || "No statement"}
        </span>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={detailId}
          aria-label={`${isOpen ? "Less" : "More"} about ${label}`}
          onClick={() => setIsOpen((open) => !open)}
          className="text-primary min-h-6 shrink-0 px-1 underline underline-offset-4"
        >
          {isOpen ? "Less" : "More"}
        </button>
      </div>
      <div className="justify-self-end [grid-area:action]">
        {isCurrentDelegate ? (
          <Badge variant="outline" className="border-primary text-primary px-2 py-1">
            Your delegate
          </Badge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            aria-label={`Delegate to ${label}`}
            onClick={onDelegate}
            className="min-h-11 @[45rem]/delegates:min-h-8"
          >
            Delegate
          </Button>
        )}
      </div>
      <div id={detailId} hidden={!isOpen} className="delegate-row-detail">
        {statement ? (
          <p className="text-sm break-words whitespace-pre-line">{statement}</p>
        ) : null}
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            <InterestChips interests={interests} />
          </div>
        ) : null}
        <code className="realm-stat text-muted-foreground text-xs wrap-anywhere">
          {delegate.user}
        </code>
      </div>
    </div>
  );
}

export function DelegateRow({
  delegate,
  isCurrentDelegate,
}: {
  delegate: DelegateRowData;
  isCurrentDelegate: boolean;
}) {
  const { sendAsync: delegateRealms } = useDelegateRealms({
    delegatee: delegate.user,
  });
  const handleDelegate = async () => {
    await delegateRealms();
    toast({
      title: "Delegation successful",
      description: "You have successfully delegated your Realms",
    });
  };

  const name = useStarkDisplayName(delegate.user as `0x${string}`);

  return (
    <DelegateRowView
      delegate={delegate}
      name={name}
      isCurrentDelegate={isCurrentDelegate}
      onDelegate={() => void handleDelegate()}
    />
  );
}

/** The same row in a dashboard panel: who, how many votes and what they stand for. */
export function DelegateSummaryView({
  delegate,
  name,
}: {
  delegate: DelegateRowData;
  name?: string;
}) {
  return (
    <div className="delegate-summary">
      <DelegateAvatar
        user={delegate.user}
        label={name || shortenAddress(delegate.user)}
      />
      <DelegateName user={delegate.user} name={name} />
      <DelegateVotes
        votes={delegate.delegatedVotes}
        unit={
          <span className="text-muted-foreground ml-1 font-sans text-xs">
            votes
          </span>
        }
      />
      <p className="text-muted-foreground min-w-0 truncate text-sm [grid-area:statement]">
        {delegate.delegateProfile?.statement || "No statement"}
      </p>
    </div>
  );
}

export function DelegateSummary({ delegate }: { delegate: DelegateRowData }) {
  const name = useStarkDisplayName(delegate.user as `0x${string}`);
  return <DelegateSummaryView delegate={delegate} name={name} />;
}
