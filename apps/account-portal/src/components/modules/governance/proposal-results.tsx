import type { ProposalFieldsFragment } from "@/gql/snapshot/graphql";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

export const ProposalResults = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment;
}) => {
  return (
    <div className="flex flex-col flex-wrap gap-2">
      <Badge
        variant="outline"
        className="border-success bg-success/10 hover:bg-success/20 flex justify-between py-2"
      >
        <span className="flex items-center">
          <CheckCircle2 className="text-success mr-2 h-5 w-5" /> Yes:
        </span>
        <span className="text-lg font-bold">{proposal.scores_1 || 0}</span>
      </Badge>

      <Badge
        variant="outline"
        className="border-destructive bg-destructive/10 hover:bg-destructive/20 flex justify-between py-2"
      >
        <span className="flex items-center">
          <XCircle className="text-destructive mr-2 h-5 w-5" /> No:
        </span>
        <span className="text-lg font-bold">{proposal.scores_2 || 0}</span>
      </Badge>
      <Badge
        variant="outline"
        className="border-muted-foreground bg-muted/20 hover:bg-muted flex justify-between py-2"
      >
        <span className="flex items-center">
          <MinusCircle className="text-muted-foreground mr-2 h-5 w-5" />{" "}
          Abstain:
        </span>
        <span className="text-lg font-bold">{proposal.scores_3 || 0}</span>
      </Badge>
    </div>
  );
};
