export interface BridgeButtonInput {
  selectedCount: number;
  /** Ethereum to Starknet with no approval yet: the button approves first. */
  needsApproval: boolean;
  isApproving: boolean;
  /** The Starknet inventory is not ready, so nothing can be withdrawn. */
  isBridgeDisabled: boolean;
  isBridging: boolean;
  /** Ethereum to Starknet only: the Starknet account is unchecked or not deployed. */
  isAccountBlocked: boolean;
  isCheckingAccount: boolean;
  hasAccountError: boolean;
  isAccountMissing: boolean;
}

/** What the bridge panel's button says and whether it can be pressed. */
export function getBridgeButtonState({
  selectedCount,
  needsApproval,
  isApproving,
  isBridgeDisabled,
  isBridging,
  isAccountBlocked,
  isCheckingAccount,
  hasAccountError,
  isAccountMissing,
}: BridgeButtonInput): { label: string; disabled: boolean } {
  const disabled =
    !selectedCount ||
    isAccountBlocked ||
    (needsApproval ? isApproving : isBridgeDisabled || isBridging);

  let label = needsApproval ? "Approve Bridge" : "Bridge";
  if (needsApproval && isApproving) label = "Approving";
  if (isAccountMissing) label = "Deploy Starknet account first";
  if (hasAccountError) label = "Unable to verify Starknet account";
  if (isCheckingAccount) label = "Checking Starknet account...";
  if (!selectedCount) label = "Select Realms";

  return { label, disabled };
}
