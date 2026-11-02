import { toast } from "@/hooks/use-toast";
import { runWithErrorToast } from "@/utils/run-with-error-toast";

/**
 * With no wallet the click only connects: a send made now would hold the render from before the
 * connection. It says "sent", never "successful": nothing has confirmed yet.
 */
export async function submitDelegation({
  isConnected,
  requestConnect,
  send,
}: {
  isConnected: boolean;
  requestConnect: () => Promise<boolean>;
  send: () => Promise<unknown>;
}): Promise<void> {
  if (!isConnected) {
    if (await requestConnect()) {
      toast({ description: "Wallet connected. Press Delegate again to sign." });
    }
    return;
  }
  await runWithErrorToast(async () => {
    await send();
    toast({ description: "Delegation sent" });
  }, "Delegation not sent");
}
