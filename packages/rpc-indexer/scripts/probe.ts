// Phase 0 capability probe: bounded, read-only checks of a Starknet RPC
// endpoint. Prints a JSON report; never prints the endpoint URL.
//
//   RPC_INDEXER_NETWORK=mainnet STARKNET_RPC_URL=... pnpm --filter @realms-world/rpc-indexer probe

import type { StarknetEvent, StarknetFilterConfig } from "../src";
import {
  BlockNotFoundError,
  decodeStarknetEvent,
  JsonRpcClient,
  normalizeFelt,
  parseRpcEnv,
  STARKNET_CHAIN_IDS,
  starknetFilters,
  StarknetReader,
} from "../src";

const MAX_CALLS = Number(process.env.PROBE_MAX_CALLS ?? 250);
const SEARCH_WINDOW = BigInt(process.env.PROBE_SEARCH_WINDOW ?? 250_000);
const SEARCH_WINDOWS = Number(process.env.PROBE_SEARCH_WINDOWS ?? 8);

const env = parseRpcEnv(process.env);
let calls = 0;
const attempts: Record<string, number> = {};
const rpc = new JsonRpcClient({
  url: env.STARKNET_RPC_URL,
  label: env.STARKNET_RPC_LABEL,
  timeoutMs: env.RPC_TIMEOUT_MS,
  maxRetries: env.RPC_MAX_RETRIES,
  onAttempt: ({ method }) => {
    attempts[method] = (attempts[method] ?? 0) + 1;
    if (++calls > MAX_CALLS) {
      throw new Error(`Probe exceeded ${MAX_CALLS} RPC attempts`);
    }
  },
});
const reader = new StarknetReader(rpc);
const report: Record<string, unknown> = {
  network: env.RPC_INDEXER_NETWORK,
  endpoint: env.STARKNET_RPC_LABEL,
};

function describe(error: unknown) {
  return error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);
}

async function check<T>(name: string, run: () => Promise<T>) {
  try {
    const result = await run();
    report[name] = { ok: true, result };
    return result;
  } catch (error) {
    report[name] = { ok: false, error: describe(error) };
    return undefined;
  }
}

function position(event: StarknetEvent) {
  return {
    block: event.blockNumber.toString(),
    transactionHash: event.transactionHash,
    transactionIndex: event.transactionIndex,
    eventIndexInTransaction: event.eventIndexInTransaction,
  };
}

function eventKey(event: StarknetEvent) {
  return [
    event.blockHash,
    event.transactionHash,
    event.eventIndexInTransaction,
    event.fromAddress,
    ...event.keys,
    "|",
    ...event.data,
  ].join(":");
}

const RANDOM_HASH = normalizeFelt(
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde",
);

async function main() {
  await check("specVersion", () => reader.specVersion());
  await check("chainId", async () => {
    const chainId = await reader.chainId();
    const expected = STARKNET_CHAIN_IDS[env.RPC_INDEXER_NETWORK];
    if (chainId !== expected) {
      throw new Error(`chain id ${chainId} does not match ${expected}`);
    }
    return chainId;
  });

  const head = await check("latestHeader", () =>
    reader.getBlockHeader("latest"),
  );
  if (!head) return;
  await check("l1AcceptedHeader", async () => {
    const header = await reader.getBlockHeader("l1_accepted");
    return {
      number: header.number.toString(),
      lag: (head.number - header.number).toString(),
    };
  });
  await check("blockCadence", async () => {
    const span = 1_000n;
    const earlier = await reader.getBlockHeader({
      block_number: Number(head.number - span),
    });
    const seconds =
      (head.timestamp.getTime() - earlier.timestamp.getTime()) / 1000;
    return {
      blocks: span.toString(),
      seconds,
      secondsPerBlock: seconds / Number(span),
    };
  });

  const headBound = { number: head.number, hash: head.hash };
  await check("rejectsUnknownBlockHash", async () => {
    try {
      await reader.getEvents({
        from: { number: 0n, hash: RANDOM_HASH },
        to: headBound,
        filters: [
          starknetFilters(env.RPC_INDEXER_NETWORK)[0] as StarknetFilterConfig,
        ],
        addressList: false,
        chunkSize: 1,
        maxPages: 1,
      });
    } catch (error) {
      if (error instanceof BlockNotFoundError) return "BLOCK_NOT_FOUND";
      throw error;
    }
    throw new Error(
      "query pinned to an unknown hash succeeded; use the three-read cycle",
    );
  });

  const filters = starknetFilters(env.RPC_INDEXER_NETWORK);
  const samples: {
    filter: StarknetFilterConfig;
    from: bigint;
    events: StarknetEvent[];
  }[] = [];
  for (const filter of filters) {
    await check(`events:${filter.id}`, async () => {
      for (let window = 0; window < SEARCH_WINDOWS; window++) {
        const to = head.number - BigInt(window) * SEARCH_WINDOW;
        const from =
          to - SEARCH_WINDOW + 1n > filter.startBlock
            ? to - SEARCH_WINDOW + 1n
            : filter.startBlock;
        if (to < filter.startBlock) break;
        const toHeader =
          to === head.number
            ? head
            : await reader.getBlockHeader({ block_number: Number(to) });
        const events = await reader.getEvents({
          from: { number: from },
          to: { number: toHeader.number, hash: toHeader.hash },
          filters: [filter],
          addressList: false,
          chunkSize: 200,
          maxPages: 5,
        });
        if (events.length > 0) {
          samples.push({ filter, from, events });
          const decoded = events.map(
            (event) => decodeStarknetEvent(event).kind,
          );
          const multiInTx = events.some((event, index) =>
            events.some(
              (other, otherIndex) =>
                otherIndex !== index &&
                other.transactionHash === event.transactionHash,
            ),
          );
          return {
            range: `${from}-${to}`,
            count: events.length,
            decodedKinds: [...new Set(decoded)],
            moreThanOneEventInATransaction: multiInTx,
            first: position(events[0] as StarknetEvent),
          };
        }
      }
      return { count: 0, note: "no events found in searched windows" };
    });
  }

  // Event positions must index the transaction receipt's events.
  for (const sample of samples) {
    const event = sample.events[0] as StarknetEvent;
    await check(`receiptPosition:${sample.filter.id}`, async () => {
      const receipt = await rpc.call<{
        events?: { from_address: string; keys: string[]; data: string[] }[];
      }>("starknet_getTransactionReceipt", {
        transaction_hash: event.transactionHash,
      });
      const atIndex = receipt.events?.[event.eventIndexInTransaction];
      const matches =
        atIndex !== undefined &&
        normalizeFelt(atIndex.from_address) === event.fromAddress &&
        atIndex.keys.map((key) => normalizeFelt(key)).join() ===
          event.keys.join() &&
        atIndex.data.map((value) => normalizeFelt(value)).join() ===
          event.data.join();
      if (!matches)
        throw new Error("event_index does not match the receipt's event list");
      return "event_index is transaction-local";
    });
  }

  // Small pages must return exactly the same events as large ones. Endpoints
  // may also split by blocks scanned, so record how many pages each took.
  const paged = samples.find(
    (sample) => sample.events.length >= 2 && sample.events.length <= 30,
  );
  if (paged) {
    await check("pagination", async () => {
      const last = paged.events.at(-1) as StarknetEvent;
      const range = {
        from: { number: paged.from },
        to: { number: last.blockNumber, hash: last.blockHash },
        filters: [paged.filter],
        addressList: false,
        maxPages: 50,
      };
      const whole = await reader.readEvents({ ...range, chunkSize: 1_000 });
      const chunkSize = Math.max(1, Math.ceil(whole.events.length / 3));
      const small = await reader.readEvents({ ...range, chunkSize });
      if (
        whole.events.map(eventKey).join() !== small.events.map(eventKey).join()
      ) {
        throw new Error("paginated result differs from large-page result");
      }
      return {
        blocks: (last.blockNumber - paged.from + 1n).toString(),
        events: whole.events.length,
        pagesAtChunk1000: whole.pages,
        chunkSize,
        pagesAtSmallChunk: small.pages,
      };
    });
  }

  // An address-list query must equal the union of individual queries.
  const earliest = samples.reduce<bigint | undefined>(
    (min, sample) =>
      min === undefined || sample.from < min ? sample.from : min,
    undefined,
  );
  if (earliest !== undefined) {
    await check("addressListParity", async () => {
      const range = {
        from: { number: earliest },
        to: headBound,
        filters,
        chunkSize: 1_000,
        maxPages: 20,
      };
      const individual = await reader.getEvents({
        ...range,
        addressList: false,
      });
      const list = await reader.getEvents({ ...range, addressList: true });
      const equal =
        individual.map(eventKey).join() === list.map(eventKey).join();
      if (!equal)
        throw new Error(
          `address list returned ${list.length} events, individual ${individual.length}`,
        );
      return { range: `${earliest}-${head.number}`, events: list.length };
    });
  }

  // One page over the full history shows whether the endpoint caps block ranges.
  await check("fullHistoryRange", async () => {
    const start = filters.reduce(
      (min, filter) => (filter.startBlock < min ? filter.startBlock : min),
      head.number,
    );
    const page = await rpc.call<{
      events: unknown[];
      continuation_token?: string;
    }>("starknet_getEvents", {
      filter: {
        from_block: { block_number: Number(start) },
        to_block: { block_hash: head.hash },
        address: (filters[0] as StarknetFilterConfig).address,
        keys: [(filters[0] as StarknetFilterConfig).selectors],
        chunk_size: 10,
      },
    });
    return {
      blocks: (head.number - start + 1n).toString(),
      firstPageEvents: page.events.length,
    };
  });
}

main()
  .catch((error: unknown) => {
    report.fatal = describe(error);
    process.exitCode = 1;
  })
  .finally(() => {
    report.rpcAttempts = attempts;
    console.log(
      JSON.stringify(
        report,
        (_key, value: unknown) =>
          typeof value === "bigint" ? value.toString() : value,
        2,
      ),
    );
  });
