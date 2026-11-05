// Minimal JSON-RPC 2.0 transport with typed failures. Every request has a
// deadline; transient failures are retried with capped exponential backoff and
// jitter. Errors never include the endpoint URL, which usually embeds an API
// key — only the configured label is reported.

export interface JsonRpcClientOptions {
  url: string;
  /** Non-secret name used in logs and errors, e.g. "alchemy-starknet". */
  label: string;
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
  onAttempt?: (event: RpcAttemptEvent) => void;
}

export interface RpcAttemptEvent {
  label: string;
  method: string;
  attempt: number;
  outcome: "ok" | "retry" | "error";
  durationMs: number;
}

export class RpcTransportError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "RpcTransportError";
  }
}

export class RpcResponseError extends Error {
  constructor(
    readonly method: string,
    readonly code: number,
    readonly rpcMessage: string,
    readonly data: unknown,
  ) {
    super(`${method} failed with JSON-RPC error ${code}: ${rpcMessage}`);
    this.name = "RpcResponseError";
  }
}

// Provider throttling commonly arrives as HTTP 200 with one of these codes or
// with a rate-limit message. -32603 is a generic internal error that Alchemy
// and Pathfinder both use for transient upstream failures.
const RETRYABLE_RPC_CODES = new Set([-32005, -32603, 429]);
const RETRYABLE_MESSAGE = /rate limit|too many requests|capacity|timeout/i;

export function isRetryableRpcError(error: RpcResponseError): boolean {
  return (
    RETRYABLE_RPC_CODES.has(error.code) ||
    RETRYABLE_MESSAGE.test(error.rpcMessage)
  );
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export class JsonRpcClient {
  readonly label: string;
  private readonly url: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly random: () => number;
  private readonly onAttempt?: (event: RpcAttemptEvent) => void;
  private nextId = 1;

  constructor(options: JsonRpcClientOptions) {
    this.url = options.url;
    this.label = options.label;
    this.timeoutMs = options.timeoutMs ?? 20_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 500;
    this.maxDelayMs = options.maxDelayMs ?? 10_000;
    this.fetchImpl = options.fetch ?? fetch;
    this.sleep = options.sleep ?? defaultSleep;
    this.random = options.random ?? Math.random;
    this.onAttempt = options.onAttempt;
  }

  async call<T>(method: string, params: unknown): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      const started = Date.now();
      try {
        const result = await this.attempt<T>(method, params);
        this.report(method, attempt, "ok", started);
        return result;
      } catch (error) {
        const retryable =
          (error instanceof RpcTransportError && error.retryable) ||
          (error instanceof RpcResponseError && isRetryableRpcError(error));
        if (!retryable || attempt >= this.maxRetries) {
          this.report(method, attempt, "error", started);
          throw error;
        }
        this.report(method, attempt, "retry", started);
        await this.sleep(this.backoff(attempt));
      }
    }
  }

  private async attempt<T>(method: string, params: unknown): Promise<T> {
    const id = this.nextId++;
    let response: Response;
    try {
      response = await this.fetchImpl(this.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      const reason =
        error instanceof Error && error.name === "TimeoutError"
          ? `timed out after ${this.timeoutMs} ms`
          : "network failure";
      throw new RpcTransportError(`${this.label} ${method} ${reason}`, true);
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new RpcTransportError(
        `${this.label} ${method} returned HTTP ${response.status}`,
        retryable,
        response.status,
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new RpcTransportError(
        `${this.label} ${method} returned a non-JSON body`,
        true,
      );
    }
    return this.unwrap<T>(method, id, body);
  }

  private unwrap<T>(method: string, id: number, body: unknown): T {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new RpcTransportError(
        `${this.label} ${method} returned a malformed envelope`,
        false,
      );
    }
    const envelope = body as Record<string, unknown>;
    if (envelope.id !== id) {
      throw new RpcTransportError(
        `${this.label} ${method} response id does not match request`,
        false,
      );
    }
    if (envelope.error !== undefined) {
      const error = envelope.error as Record<string, unknown> | null;
      const code = typeof error?.code === "number" ? error.code : 0;
      const message =
        typeof error?.message === "string" ? error.message : "unknown error";
      throw new RpcResponseError(method, code, message, error?.data);
    }
    if (!("result" in envelope)) {
      throw new RpcTransportError(
        `${this.label} ${method} response has neither result nor error`,
        false,
      );
    }
    return envelope.result as T;
  }

  private backoff(attempt: number): number {
    const ceiling = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** attempt);
    // Jitter (50–100% of the ceiling) keeps concurrent streams from retrying
    // in lockstep.
    return Math.round(ceiling * (0.5 + this.random() / 2));
  }

  private report(
    method: string,
    attempt: number,
    outcome: RpcAttemptEvent["outcome"],
    started: number,
  ) {
    this.onAttempt?.({
      label: this.label,
      method,
      attempt,
      outcome,
      durationMs: Date.now() - started,
    });
  }
}
