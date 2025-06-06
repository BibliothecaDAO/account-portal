import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import BridgeIcon from "@/components/icons/bridge.svg?react";
import { RealmCard } from "@/components/modules/realms/realm-card";
import { Button } from "@/components/ui/button";
import { getAccountTokensQueryOptions } from "@/lib/eternum/getPortfolioCollections";
import { formatAddress, SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { useAccount } from "@starknet-react/core";
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  ErrorComponent,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { HandCoins } from "lucide-react";

import { CollectionAddresses } from "@realms-world/constants";

export class RealmsNotFoundError extends Error {}

export const Route = createFileRoute("/realms/")({
  errorComponent: RealmsErrorComponent,
  component: RealmsComponent,
});
function RealmsErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  if (error instanceof RealmsNotFoundError) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <button
        onClick={async () => {
          await router.invalidate();
        }}
      >
        retry
      </button>
      <ErrorComponent error={error} />
    </div>
  );
}
function RealmsComponent() {
  const { address } = useAccount();

  const l2RealmsQuery = useSuspenseQuery(
    getAccountTokensQueryOptions({
      address: address,
      collectionAddress: CollectionAddresses.realms[
        SUPPORTED_L2_CHAIN_ID
      ] as string,
    }),
  );
  const l2Realms = l2RealmsQuery?.data;
  if (!address) {
    return <div>Connect Starknet Wallet to view your Realms</div>;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex gap-2">
        <Link to={`/realms/bridge`}>
          <Button variant={"outline"} size="lg" className="rounded px-3">
            <BridgeIcon className="!h-5 !w-5" /> Starknet Bridge
          </Button>
        </Link>
        <Link to={`/realms/claims`}>
          <Button variant={"outline"} size="lg" className="rounded px-3">
            <HandCoins /> Claim Lords
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:p-4">
        {l2Realms?.length
          ? l2Realms.map((realm) => {
              return (
                <RealmCard key={realm.tokenId} token={realm} isGrid={true} />
              );
            })
          : "No Realms Found in wallet"}
      </div>
    </div>
  );
}
