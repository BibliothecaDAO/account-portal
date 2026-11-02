import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const SNAPSHOT_SPACE_URL =
  "https://snapshot.box/#/sn:0x07bd3419669f9f0cc8f19e9e2457089cdd4804a4c41a5729ee9c7fd02ab8ab62";

/** Outbound link to the Realms DAO Snapshot space. */
export function SnapshotLink() {
  return (
    <Button asChild variant="outline" size="sm">
      <a target="_blank" rel="noopener noreferrer" href={SNAPSHOT_SPACE_URL}>
        <ExternalLink />
        Snapshot
      </a>
    </Button>
  );
}
