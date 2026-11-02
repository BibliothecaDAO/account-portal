import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

const choices = {
  1: {
    label: "For",
    icon: CheckCircle2,
    className: "border-success text-success",
  },
  2: {
    label: "Against",
    icon: XCircle,
    className: "border-destructive text-destructive",
  },
  3: {
    label: "Abstain",
    icon: MinusCircle,
    className: "border-border-strong text-muted-foreground",
  },
} as const;

export const ProposalUserVoteBadge = ({ choice }: { choice: 1 | 2 | 3 }) => {
  const config = choices[choice] as (typeof choices)[1 | 2 | 3] | undefined;
  if (!config) return null;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={config.className}>
      <Icon />
      {config.label}
    </Badge>
  );
};
