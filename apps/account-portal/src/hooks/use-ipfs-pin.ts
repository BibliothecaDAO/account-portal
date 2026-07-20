import type { IpfsPayload, PinResult } from "@/lib/ipfs/pin-payload";
import { useCallback, useState } from "react";
import { pinPayload } from "@/lib/ipfs/pin-payload";

/**
 * React hook for pinning data to IPFS using different providers
 */
export function useIPFSPin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<PinResult | null>(null);

  const pinToIPFS = useCallback(
    async (payload: IpfsPayload): Promise<PinResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const pinResult = await pinPayload(payload);

        setResult(pinResult);
        return pinResult;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown error while pinning to IPFS");
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    pinToIPFS,
    isLoading,
    error,
    result,
  };
}
