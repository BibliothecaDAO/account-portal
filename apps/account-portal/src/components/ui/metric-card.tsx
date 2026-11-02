import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn, formatCompact } from "@/utils/utils";

export interface MetricCardProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  /** Show large numeric values as 17.2M; the full value stays in the title tooltip. */
  compact?: boolean;
  className?: string;
  valueClassName?: string;
}

/** Stat tile: muted label, mono tabular value, optional hint. Tokens only; never clips. */
export function MetricCard({
  label,
  value,
  hint,
  icon,
  compact = false,
  className,
  valueClassName,
}: MetricCardProps) {
  const isText = typeof value === "string" || typeof value === "number";
  const display = isText && compact ? formatCompact(value) : value;

  return (
    <Card className={cn("h-full min-w-0 gap-0 p-4", className)}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="realm-label">{label}</p>
        {icon ? (
          <span className="text-muted-foreground shrink-0 [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
      </div>
      <div
        title={isText ? String(value) : undefined}
        className={cn(
          "realm-stat mt-2 min-w-0 text-xl font-semibold break-words tabular-nums sm:text-2xl",
          valueClassName,
        )}
      >
        {display}
      </div>
      {hint ? (
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      ) : null}
    </Card>
  );
}
