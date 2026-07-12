import type { Choice } from "@/types/snapshot";

export function isVoteChoiceSelected(choice: Choice | null): choice is Choice {
  return choice !== null;
}
