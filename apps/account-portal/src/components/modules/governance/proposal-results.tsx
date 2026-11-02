import type { Proposal } from "@/gql/snapshot/graphql";
import { cn } from "@/utils/utils";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

type ProposalResultScores = Pick<
  Proposal,
  "scores_1" | "scores_2" | "scores_3"
>;

const rows = [
  {
    key: "scores_1",
    label: "For",
    icon: CheckCircle2,
    text: "text-success",
    bar: "bg-success",
  },
  {
    key: "scores_2",
    label: "Against",
    icon: XCircle,
    text: "text-destructive",
    bar: "bg-destructive",
  },
  {
    key: "scores_3",
    label: "Abstain",
    icon: MinusCircle,
    text: "text-muted-foreground",
    bar: "bg-muted-foreground",
  },
] as const;

/** For / Against / Abstain tallies with a share bar per choice. */
export const ProposalResults = ({
  proposal,
}: {
  proposal: ProposalResultScores;
}) => {
  const scores = rows.map((row) => Number(proposal[row.key] ?? 0) || 0);
  const total = scores.reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => {
        const value = scores[index] ?? 0;
        const share = total > 0 ? (value / total) * 100 : 0;
        const Icon = row.icon;
        return (
          <div key={row.key} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <Icon className={cn("size-4", row.text)} />
                {row.label}
              </span>
              <span className="realm-stat">
                {value.toLocaleString()}
                <span className="text-muted-foreground ml-2 text-xs">
                  {share.toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={cn("h-full rounded-full", row.bar)}
                style={{ width: `${share}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
