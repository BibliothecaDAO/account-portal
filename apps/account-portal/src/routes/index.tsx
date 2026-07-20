import { Suspense } from "react";
import { EthereumConnect } from "@/components/layout/ethereum-connect";
import { LoginCard } from "@/components/layout/login-card";
import { Homepage } from "@/components/modules/homepage/homepage";
import { HomepageSkeleton } from "@/components/modules/homepage/homepage-skeleteon";
import { useAccount } from "@starknet-start/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const { address } = useAccount();
  if (!address) {
    return <LoginCard />;
  }
  return (
    <div className="realm-shell flex flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
      {/* Dashboard Statistics */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="realm-eyebrow">Account Portal</p>
            <h1 className="realm-page-title text-3xl sm:text-4xl">Dashboard</h1>
          </div>
          <EthereumConnect />
        </div>
        <Suspense fallback={<HomepageSkeleton />}>
          <Homepage address={address} />
        </Suspense>
      </div>
    </div>
  );
}
