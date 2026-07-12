export type FetchImplementation = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface RequestJsonOptions extends RequestInit {
  fetchImpl?: FetchImplementation;
  requestName?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export async function requestJson<TResult>(
  input: string | URL | Request,
  {
    fetchImpl = fetch,
    requestName = "Request",
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: callerSignal,
    ...init
  }: RequestJsonOptions = {},
): Promise<TResult> {
  const controller = new AbortController();
  let didTimeOut = false;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);

  if (callerSignal?.aborted) {
    abortFromCaller();
  } else {
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  const timeout = setTimeout(() => {
    didTimeOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetchImpl(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${requestName} failed with HTTP ${response.status}`);
    }

    try {
      return (await response.json()) as TResult;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      throw new Error(`${requestName} returned invalid JSON`, { cause: error });
    }
  } catch (error) {
    if (didTimeOut) {
      throw new Error(`${requestName} timed out after ${timeoutMs}ms`, {
        cause: error,
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}
