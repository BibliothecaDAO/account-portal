import type { AccountToken } from "@/lib/eternum/getPortfolioCollections";
import type { RealmMetadata } from "@/lib/eternum/realm-metadata";
import { AnimatedMap } from "@/components/icons/AnimatedMap";
import { Card, CardContent } from "@/components/ui/card";
import { parseRealmMetadata } from "@/lib/eternum/realm-metadata";

import Media from "./media";
import RealmResources from "./realm-resources";

const GridDetails = ({
  token,
}: {
  token: RealmMetadata | null;
  address?: string;
}) => (
  <div className="flex h-full w-full flex-col justify-between">
    <div className="pb-2">
      <span className="truncate">{token?.name}</span>
    </div>
    <div className="h-[48px]">
      <RealmResources traits={token?.attributes ?? []} />
    </div>
  </div>
);

export const RealmCard = ({
  token,
  isGrid,
}: {
  token: AccountToken;
  isGrid?: boolean;
}) => {
  const { metadata } = token;
  const parsedMetadata = parseRealmMetadata(metadata);
  const { name, image } = parsedMetadata ?? {};

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        {image ? (
          <Media src={image} alt={name ?? ""} mediaKey={""} />
        ) : (
          <div className="w-full max-w-sm">
            <AnimatedMap />
          </div>
        )}
        {isGrid && (
          <span className="bg-foreground text-background absolute right-1 bottom-1 px-1 py-1 text-xs">
            #{Number(token.token_id)}
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <GridDetails token={parsedMetadata} />
      </CardContent>
    </Card>
  );
};
