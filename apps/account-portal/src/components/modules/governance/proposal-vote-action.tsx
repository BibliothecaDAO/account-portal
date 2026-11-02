import type { Proposal } from "@/gql/graphql";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVoteProposal } from "@/hooks/governance/use-vote-proposal";
import { useStarknetWallet } from "@/hooks/use-starknet-wallet";
import { toast } from "@/hooks/use-toast";
import { Choice } from "@/types/snapshot";
import { useAccount } from "@starknet-start/react";
import { Check, Minus, X } from "lucide-react";

import { submitVote } from "./submit-vote";

/** The three labeled vote buttons, in the order For, Against, Abstain. */
export function ProposalVoteButtons({
  onChoose,
}: {
  onChoose?: (choice: Choice) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => onChoose?.(Choice.For)}
        variant="outline"
        size="sm"
        className="text-success"
      >
        <Check />
        For
      </Button>
      <Button
        onClick={() => onChoose?.(Choice.Against)}
        variant="outline"
        size="sm"
        className="text-destructive"
      >
        <X />
        Against
      </Button>
      <Button
        onClick={() => onChoose?.(Choice.Abstain)}
        variant="outline"
        size="sm"
      >
        <Minus />
        Abstain
      </Button>
    </div>
  );
}

export interface ProposalVoteDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  proposalTitle: string;
  selectedChoice: Choice | null;
  onChoiceChange?: (choice: Choice) => void;
  reason: string;
  onReasonChange?: (reason: string) => void;
  isSubmitting?: boolean;
  onSubmit?: () => void;
}

export function ProposalVoteDialog({
  open,
  onOpenChange,
  proposalTitle,
  selectedChoice,
  onChoiceChange,
  reason,
  onReasonChange,
  isSubmitting = false,
  onSubmit,
}: ProposalVoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Vote</DialogTitle>
          <DialogDescription>
            <span className="break-words">
              You are voting on: {proposalTitle}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <RadioGroup
            value={selectedChoice?.toString()}
            onValueChange={(value) => onChoiceChange?.(Number(value) as Choice)}
            className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={Choice.For.toString()}
                id="vote-for"
                className="text-success"
              />
              <Label
                htmlFor="vote-for"
                className="text-success flex items-center"
              >
                <Check className="mr-1 h-4 w-4" /> For
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={Choice.Against.toString()}
                id="vote-against"
                className="text-destructive"
              />
              <Label
                htmlFor="vote-against"
                className="text-destructive flex items-center"
              >
                <X className="mr-1 h-4 w-4" /> Against
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={Choice.Abstain.toString()}
                id="vote-abstain"
                className="text-muted-foreground"
              />
              <Label
                htmlFor="vote-abstain"
                className="text-muted-foreground flex items-center"
              >
                <Minus className="mr-1 h-4 w-4" /> Abstain
              </Label>
            </div>
          </RadioGroup>

          <div className="grid gap-2">
            <Label htmlFor="vote-reason">Reason (optional)</Label>
            <Input
              id="vote-reason"
              value={reason}
              onChange={(e) => onReasonChange?.(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button onClick={() => onOpenChange?.(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit Vote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ProposalVoteAction = ({ proposal }: { proposal: Proposal }) => {
  const { vote, selectedChoice, setSelectedChoice } = useVoteProposal(proposal);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [voteReason, setVoteReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const proposalTitle =
    (proposal as { metadata?: { title?: string } }).metadata?.title ??
    "this proposal";
  const { address } = useAccount();
  const { requestConnect } = useStarknetWallet();

  const openVoteDialog = async (choice: Choice) => {
    if (!address && !(await requestConnect())) {
      return;
    }

    setSelectedChoice(choice);
    setVoteReason("");
    setDialogOpen(true);
  };

  const handleVoteSubmit = async () => {
    if (selectedChoice === null) return;
    setIsSubmitting(true);
    const sent = await submitVote(vote, voteReason);
    setIsSubmitting(false);
    if (sent) {
      setDialogOpen(false);
      toast({ description: "Vote sent" });
    } else {
      toast({
        variant: "destructive",
        description: "Vote not sent. Nothing changed, so you can try again.",
      });
    }
  };

  return (
    <>
      <ProposalVoteButtons onChoose={(choice) => void openVoteDialog(choice)} />
      <ProposalVoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        proposalTitle={proposalTitle}
        selectedChoice={selectedChoice}
        onChoiceChange={setSelectedChoice}
        reason={voteReason}
        onReasonChange={setVoteReason}
        isSubmitting={isSubmitting}
        onSubmit={() => void handleVoteSubmit()}
      />
    </>
  );
};
