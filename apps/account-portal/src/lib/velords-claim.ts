function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractClaimableAmount(simulation: unknown): bigint {
  if (!Array.isArray(simulation)) return 0n;

  const firstSimulation: unknown = simulation[0];
  if (!isRecord(firstSimulation)) return 0n;

  const transactionTrace = firstSimulation.transaction_trace;
  if (!isRecord(transactionTrace)) return 0n;

  const executeInvocation = transactionTrace.execute_invocation;
  if (!isRecord(executeInvocation)) return 0n;

  const result = executeInvocation.result;
  if (!Array.isArray(result)) return 0n;

  const amount: unknown = result[2];
  if (typeof amount !== "string" && typeof amount !== "bigint") return 0n;

  try {
    return BigInt(amount);
  } catch {
    return 0n;
  }
}
