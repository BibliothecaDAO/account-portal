/** True only when a vote reached the wallet. A rejection or a vote that was never sent is false. */
export async function submitVote(
  vote: (reason: string) => Promise<unknown>,
  reason: string,
): Promise<boolean> {
  try {
    return (await vote(reason)) != null;
  } catch (error) {
    console.error("Error submitting vote:", error);
    return false;
  }
}
