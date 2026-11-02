import LordsIcon from "@/components/icons/lords.svg?react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import useVeLordsClaims from "@/hooks/use-velords-claims";
import type { ClaimRead } from "@/lib/claim-read";
import { formatClaimRead, hasClaimable } from "@/lib/claim-read";

export interface VelordsRewardsViewProps {
  claimable: ClaimRead;
  recipient: string;
  onRecipientChange?: (recipient: string) => void;
  isRecipientValid: boolean;
  canClaim: boolean;
  isSubmitting?: boolean;
  onClaim?: () => void;
}

/** Presentational rewards panel: claimable LORDS, optional recipient and the claim action. */
export function VelordsRewardsView({
  claimable,
  recipient,
  onRecipientChange,
  isRecipientValid,
  canClaim,
  isSubmitting = false,
  onClaim,
}: VelordsRewardsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>veLORDS rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <LordsIcon className="w-9 shrink-0" />
            <span className="realm-stat text-3xl font-semibold">
              {formatClaimRead(claimable)}
            </span>{" "}
            <span className="text-muted-foreground text-sm">LORDS to claim</span>
          </div>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button className="p-0" variant={"link"}>
                + Change Recipient
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Input
                placeholder="Recipient"
                value={recipient}
                onChange={(e) => onRecipientChange?.(e.target.value)}
              />
              {!isRecipientValid && (
                <p className="text-destructive mt-2 text-xs">
                  Enter a valid Starknet recipient address.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
          {claimable.status === "failed" ? (
            <p className="text-muted-foreground text-sm">
              Your claimable LORDS could not be read. Reload the page to try again.
            </p>
          ) : (
            <Button
              onClick={onClaim}
              className="w-full"
              disabled={isSubmitting || !canClaim}
            >
              {isSubmitting ? "Claiming…" : "Claim LORDS"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground flex-col gap-2 text-xs">
        <div className="flex items-center gap-2">
          veLORDS rewards are distributed at weekly epochs
        </div>
      </CardFooter>
    </Card>
  );
}

export const VelordsRewards = () => {
  const {
    recipient,
    setRecipient,
    isRecipientValid,
    claimCall,
    lordsClaimable,
    claimRewards,
    claimIsSubmitting,
  } = useVeLordsClaims();
  const handleClaimRewards = async () => {
    try {
      const hash = await claimRewards();
      toast({
        description: (
          <div className="flex items-center gap-2">
            LORDS claimed · {hash.transaction_hash}
          </div>
        ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Unable to claim rewards.",
      });
    }
  };

  return (
    <VelordsRewardsView
      claimable={lordsClaimable}
      recipient={recipient}
      onRecipientChange={setRecipient}
      isRecipientValid={isRecipientValid}
      canClaim={isRecipientValid && !!claimCall && hasClaimable(lordsClaimable)}
      isSubmitting={claimIsSubmitting}
      onClaim={() => void handleClaimRewards()}
    />
  );
};
