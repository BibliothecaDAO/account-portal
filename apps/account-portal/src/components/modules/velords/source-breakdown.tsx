import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVelordsSourceLabel } from "@/lib/velords-sources";
import { formatCompact, formatNumber, shortenAddress } from "@/utils/utils";
import { formatUnits } from "viem";

export interface SourceBreakdownItem {
  sender: string;
  totalWei: string;
  txCount: number;
  sharePercent: string;
}

function SourceCell({
  sender,
  addressUrl,
}: {
  sender: string;
  addressUrl: (address: string) => string;
}) {
  const label = getVelordsSourceLabel(sender);
  // An unknown source's label is its whole address; the short form below stands in for it.
  const isNamed = label !== sender;
  return (
    <TableCell className="pl-0 whitespace-normal">
      {isNamed ? <div className="font-medium wrap-anywhere">{label}</div> : null}
      <a
        href={addressUrl(sender)}
        target="_blank"
        rel="noopener noreferrer"
        title={sender}
        aria-label={`View source ${sender} on the explorer`}
        className="text-muted-foreground hover:text-foreground inline-flex min-h-6 items-center font-mono text-xs whitespace-nowrap underline underline-offset-4"
      >
        {shortenAddress(sender)}
      </a>
    </TableCell>
  );
}

/** Every column fits its panel: the source cell wraps, and large amounts are compact. */
export function VelordsSourceBreakdown({
  data,
  isLoading,
  addressUrl,
}: {
  data: SourceBreakdownItem[];
  isLoading?: boolean;
  addressUrl: (address: string) => string;
}) {
  return (
    <SectionCard
      title="Reward sources"
      description="Where this period's LORDS rewards came from."
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No rewards source data for this period.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-0">Source</TableHead>
              <TableHead className="px-1.5 text-right">LORDS</TableHead>
              <TableHead className="px-1.5 text-right">Share</TableHead>
              <TableHead className="pr-0 pl-1.5 text-right">Txs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const lords = formatNumber(
                Number(formatUnits(BigInt(item.totalWei), 18)),
                0,
              );
              return (
                <TableRow key={item.sender}>
                  <SourceCell sender={item.sender} addressUrl={addressUrl} />
                  <TableCell className="realm-stat px-1.5 text-right" title={lords}>
                    {formatCompact(lords)}
                  </TableCell>
                  <TableCell className="realm-stat px-1.5 text-right">
                    {item.sharePercent}%
                  </TableCell>
                  <TableCell
                    className="realm-stat pr-0 pl-1.5 text-right"
                    title={String(item.txCount)}
                  >
                    {formatCompact(formatNumber(item.txCount, 0))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}
