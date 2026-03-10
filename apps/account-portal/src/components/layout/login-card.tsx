import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { StarknetWalletButton } from "./starknet-wallet-button";

export function LoginCard() {
  return (
    <Card className="mx-auto mt-12 w-full max-w-xl">
      <CardHeader>
        <div className="realm-kicker mx-auto mb-2">Realms World</div>
        <CardTitle className="text-center text-3xl">
          Welcome to Realms Portal
        </CardTitle>
        <CardDescription className="text-center">
          Connect your wallet to access the Realms ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature list */}
        <div className="space-y-4">
          <FeatureItem
            title="Bridge Assets"
            description="Transfer your assets seamlessly between Ethereum and StarkNet"
            icon="🌉"
          />
          <FeatureItem
            title="LORDS Claiming"
            description="Claim and manage your LORDS tokens"
            icon="👑"
          />
          <FeatureItem
            title="veLORDS Staking"
            description="Stake your LORDS to earn rewards and voting power"
            icon="⚡"
          />
          <FeatureItem
            title="Governance"
            description="Participate in shaping the future of Realms"
            icon="🏛️"
          />
        </div>

        {/* Connect wallet button */}
        <div className="w-full pt-4">
          <StarknetWalletButton className="w-full" variant="reference" />
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="border-border/50 bg-background/10 flex items-start gap-3 rounded-[0.9rem] border px-3 py-3">
      <div className="border-border/50 bg-background/30 flex h-10 w-10 items-center justify-center rounded-full border text-2xl">
        {icon}
      </div>
      <div>
        <h3 className="[font-family:var(--font-ui)] text-sm font-semibold tracking-[0.12em] uppercase">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
