import type { ProposalFieldsFragment } from "@/gql/snapshot/graphql";
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
import { normalizeProposalMetadata } from "@/lib/snapshot/proposal-metadata";
import { Choice } from "@/types/snapshot";
import { useAccount } from "@starknet-start/react";
import { Check, Minus, X } from "lucide-react";

export const ProposalVoteAction = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment;
}) => {
  const { vote, selectedChoice, setSelectedChoice } = useVoteProposal(proposal);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [voteReason, setVoteReason] = useState("");
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const proposalTitle =
    normalizeProposalMetadata(proposal.metadata).title ?? "this proposal";
  const { address } = useAccount();
  const { openStarknetKitModal } = useStarknetWallet();

  const openVoteDialog = async (choice: Choice) => {
    if (!address) {
      await openStarknetKitModal();
    }

    setSelectedChoice(choice);
    setVoteError(null);
    setVoteReason(
      choice === Choice.For
        ? "I support this proposal"
        : choice === Choice.Against
          ? "I oppose this proposal"
          : "I abstain from this proposal",
    );
    setDialogOpen(true);
  };

  const handleVoteSubmit = async () => {
    if (selectedChoice === null || isSubmitting) return;

    setIsSubmitting(true);
    setVoteError(null);
    try {
      const result = await vote(voteReason);
      if (!result) throw new Error("Vote was not submitted");
      setDialogOpen(false);
    } catch {
      setVoteError("Your vote was not submitted. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => openVoteDialog(Choice.For)}
          variant="outline"
          size="icon"
          className="border-success bg-success/10 hover:bg-success/20 rounded-full"
          title="Vote FOR"
        >
          <Check className="text-success h-5 w-5" />
        </Button>
        <Button
          onClick={() => openVoteDialog(Choice.Abstain)}
          variant="outline"
          size="icon"
          className="border-muted-foreground bg-muted hover:bg-muted/80 rounded-full"
          title="Vote ABSTAIN"
        >
          <Minus className="text-muted-foreground h-5 w-5" />
        </Button>
        <Button
          onClick={() => openVoteDialog(Choice.Against)}
          variant="outline"
          size="icon"
          className="border-destructive bg-destructive/10 hover:bg-destructive/20 rounded-full"
          title="Vote AGAINST"
        >
          <X className="text-destructive h-5 w-5" />
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) setDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              You are voting on: {proposalTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <RadioGroup
              disabled={isSubmitting}
              value={selectedChoice?.toString()}
              onValueChange={(value) =>
                setSelectedChoice(Number(value) as Choice)
              }
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={Choice.For.toString()}
                  id="vote-for"
                  className="border-success"
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
                  value={Choice.Abstain.toString()}
                  id="vote-abstain"
                  className="border-muted-foreground"
                />
                <Label
                  htmlFor="vote-abstain"
                  className="text-muted-foreground flex items-center"
                >
                  <Minus className="mr-1 h-4 w-4" /> Abstain
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={Choice.Against.toString()}
                  id="vote-against"
                  className="border-destructive"
                />
                <Label
                  htmlFor="vote-against"
                  className="text-destructive flex items-center"
                >
                  <X className="mr-1 h-4 w-4" /> Against
                </Label>
              </div>
            </RadioGroup>

            <div className="grid gap-2">
              <Label htmlFor="vote-reason">Reason for your vote</Label>
              <Input
                disabled={isSubmitting}
                id="vote-reason"
                value={voteReason}
                onChange={(e) => setVoteReason(e.target.value)}
                placeholder="Enter your reason for voting this way"
              />
            </div>
            {voteError && (
              <p role="alert" className="text-destructive text-sm">
                {voteError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleVoteSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
