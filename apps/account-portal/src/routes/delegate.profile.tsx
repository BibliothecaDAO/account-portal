import { LoginCard } from "@/components/layout/login-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DelegateProfileForm } from "@/components/modules/governance/delegate-profile-form";
import { DelegateStats } from "@/components/modules/governance/delegate-stats";
import { Login } from "@/components/modules/governance/sign-in-with-starknet";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStarkDisplayName } from "@/hooks/use-stark-name";
import {
  createDelegateProfile,
  getDelegateByIDQueryOptions,
} from "@/lib/getDelegates";
import { auth } from "@/utils/auth";
import { authClient } from "@/utils/auth-client";
import { shortenAddress } from "@/utils/utils";
import { useAccount } from "@starknet-start/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const { headers } = getRequest();
  const session = await auth.api.getSession({ headers });

  return session?.session.id ?? null;
});

export const Route = createFileRoute("/delegate/profile")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: ({ signal }) => getUser({ signal }),
    }); // we're using react-query for caching, see router.tsx
    return { session };
  },
});

function RouteComponent() {
  const { address } = useAccount();
  const { data: delegate, isLoading } = useQuery(
    getDelegateByIDQueryOptions({ address: address }),
  );
  const name = useStarkDisplayName(address as `0x${string}`);

  const { data: session } = authClient.useSession();

  if (!address) {
    return (
      <PageContainer width="narrow">
        <LoginCard />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Your Delegate Profile"
        description={
          <>
            Tell token holders what you stand for.{" "}
            {session?.user.id ? (
              <span className="realm-stat break-all">
                {shortenAddress(session.user.id)}
              </span>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-3">
        {isLoading ? (
          <Skeleton className="h-96 rounded-xl @3xl:col-span-2" />
        ) : (
          <SectionCard
            className="@3xl:col-span-2"
            title="Profile"
            description="Your statement, interests and socials are shown on the delegate list."
          >
            <DelegateProfileForm
              delegate={
                delegate?.delegateProfile
                  ? {
                      delegateProfile: {
                        statement: delegate.delegateProfile.statement,
                        interests:
                          delegate.delegateProfile.interests ?? undefined,
                        twitter: delegate.delegateProfile.twitter ?? "",
                        github: delegate.delegateProfile.github ?? "",
                        telegram: delegate.delegateProfile.telegram ?? "",
                        discord: delegate.delegateProfile.discord ?? "",
                      },
                    }
                  : undefined
              }
              onSubmit={async (data) => {
                await createDelegateProfile({ data });
              }}
            />
          </SectionCard>
        )}
        <aside className="flex flex-col gap-6 @3xl:sticky @3xl:top-20">
          <SectionCard title="Account">
            <div className="space-y-3 text-sm">
              <Login />
              {name ? (
                <p className="realm-stat break-all">{name}</p>
              ) : (
                <p className="text-muted-foreground">
                  Connect your wallet to view your profile information
                </p>
              )}
            </div>
          </SectionCard>
          {delegate && (
            <SectionCard title="Delegation">
              <DelegateStats
                className="grid grid-cols-2 gap-3 @3xl:grid-cols-1"
                delegatedVotes={delegate.delegatedVotes}
                tokenHolders={delegate.tokenHoldersRepresentedAmount}
              />
            </SectionCard>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
