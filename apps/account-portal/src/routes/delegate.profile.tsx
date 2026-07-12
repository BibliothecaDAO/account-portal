import type { DelegateProfileInput } from "@/lib/governance/delegate-input";
import { LoginCard } from "@/components/layout/login-card";
import { DelegateProfileForm } from "@/components/modules/governance/delegate-profile-form";
import { Login } from "@/components/modules/governance/sign-in-with-starknet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useStarkDisplayName } from "@/hooks/use-stark-name";
import { useToast } from "@/hooks/use-toast";
import {
  createDelegateProfile,
  getDelegateByIDQueryOptions,
} from "@/lib/getDelegates";
import { authClient } from "@/utils/auth-client";
import { formatNumber, shortenAddress } from "@/utils/utils";
import { useAccount } from "@starknet-start/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Users, Vote } from "lucide-react";

export const Route = createFileRoute("/delegate/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { address } = useAccount();
  const { data: session } = authClient.useSession();
  const profileAddress = session?.user.id;
  const { data: delegate, isLoading } = useQuery(
    getDelegateByIDQueryOptions({ address: profileAddress }),
  );
  const name = useStarkDisplayName(profileAddress as `0x${string}`);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveProfile = useMutation({
    mutationFn: async (
      data: DelegateProfileInput & { interests: string[] },
    ) => {
      const result = await createDelegateProfile({ data });
      if (!result.success) throw new Error("session-expired");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["getDelegateByID"] });
      toast({ description: "Delegate profile saved." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description:
          error instanceof Error && error.message === "session-expired"
            ? "Your session expired. Sign in again before saving."
            : "Unable to save your delegate profile. Please try again.",
      });
    },
  });

  if (!address) {
    return <LoginCard />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "25rem",
          "--sidebar-width-mobile": "25rem",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <div className="container mx-auto space-y-4 px-4 py-6 sm:px-6 sm:py-8">
          <p className="realm-eyebrow">Governance</p>
          <h1 className="realm-page-title text-3xl sm:text-4xl">
            Your Profile {shortenAddress(session?.user.id)}
          </h1>
          {!isLoading && (
            <Card>
              <CardContent className="p-6">
                <DelegateProfileForm
                  isSubmitting={saveProfile.isPending}
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
                  onSubmit={(data) => saveProfile.mutateAsync(data)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
      <Sidebar
        side="right"
        variant="inset"
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      >
        <SidebarContent>
          <SidebarHeader>
            <Login />
          </SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>Profile Information</SidebarGroupLabel>
            <div className="p-4 text-sm">
              {name ? (
                <p>{name}</p>
              ) : (
                <p>Connect your wallet to view your profile information</p>
              )}
            </div>
          </SidebarGroup>

          {delegate && (
            <SidebarGroup>
              <SidebarGroupLabel>Delegation Statistics</SidebarGroupLabel>
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <Vote className="text-primary h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Delegated Votes
                      </span>
                      <Badge variant="outline" className="text-primary text-xl">
                        {formatNumber(Number(delegate.delegatedVotes)) || "0"}{" "}
                        Realms
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="text-primary h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Token Holders Represented
                      </span>
                      <Badge variant="outline" className="text-primary text-xl">
                        {delegate.tokenHoldersRepresentedAmount || "0"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
