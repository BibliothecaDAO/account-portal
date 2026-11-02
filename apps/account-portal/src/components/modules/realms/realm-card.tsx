import type { RealmInventoryToken } from "@/lib/realms/get-realm-inventory";
import { AnimatedMap } from "@/components/icons/AnimatedMap";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/utils";

import Media from "./media";
import RealmResources from "./realm-resources";

export interface RealmMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number | undefined;
  }[];
}

const GridDetails = ({
  token,
  tokenId,
}: {
  token: RealmMetadata | null;
  tokenId: number;
  address?: string;
}) => (
  <div className="flex h-full w-full min-w-0 flex-col justify-between">
    <div className="min-w-0 pb-2">
      <span className="block truncate">
        {token?.name ?? `Realm #${tokenId}`}
      </span>
    </div>
    <div className="h-11">
      <RealmResources traits={token?.attributes ?? []} />
    </div>
  </div>
);

export const RealmCard = ({
  token,
  isGrid,
  borderless = false,
}: {
  token: RealmInventoryToken;
  isGrid?: boolean;
  /** For tiles inside a panel, whose edge already frames them. */
  borderless?: boolean;
}) => {
  const { metadata, metadata_status: metadataStatus } = token;
  const parsedMetadata = metadata
    ? (JSON.parse(metadata) as RealmMetadata)
    : null;
  const { name, image } = parsedMetadata ?? {};

  return (
    <Card className={cn("relative overflow-hidden", borderless && "border-0")}>
      <div className="relative">
        {image || metadataStatus === "unavailable" ? (
          <Media
            src={image}
            alt={name ?? ""}
            mediaKey={""}
            unavailable={metadataStatus === "unavailable"}
          />
        ) : (
          <div className="w-full max-w-sm">
            <AnimatedMap />
          </div>
        )}
        {isGrid && (
          <span className="bg-background/85 text-foreground absolute right-1 bottom-1 rounded-sm px-1 py-1 text-xs">
            #{Number(token.token_id)}
          </span>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <GridDetails token={parsedMetadata} tokenId={token.token_id} />
      </CardContent>
    </Card>
  );
};
