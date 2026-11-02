import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { StarknetWalletButton } from "./starknet-wallet-button";

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-baseline gap-2 px-1">
      <span className="text-primary text-xs">&#x25C6;</span>
      <div>
        <h3 className="realm-card-title text-sm">{title}</h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  );
}

export function LoginCardView({ action }: { action: ReactNode }) {
  return (
    <Card className="mx-auto mt-6 w-full max-w-md sm:mt-12">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-2xl">Connect your wallet</CardTitle>
        <CardDescription>
          Use a Starknet wallet to manage your Realms, LORDS and votes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <FeatureItem
            title="Bridge Realms"
            description="Move Realms between Ethereum and Starknet"
          />
          <FeatureItem
            title="Claim LORDS"
            description="Collect Realm emissions and veLORDS rewards"
          />
          <FeatureItem
            title="Stake LORDS"
            description="Lock LORDS for voting power and weekly rewards"
          />
          <FeatureItem
            title="Vote"
            description="Delegate your Realms and vote on DAO proposals"
          />
        </div>

        {action}
      </CardContent>
    </Card>
  );
}

export function LoginCard() {
  return (
    <LoginCardView
      action={<StarknetWalletButton className="w-full" variant="reference" />}
    />
  );
}
