// Read-only bounded scan using pinned Envio 3.12.1 native internals.
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

export function parseOptions(args) {
  const allowed = new Set([
    "network",
    "from",
    "to",
    "recent",
    "max-calls",
    "max-events",
    "chunk-blocks",
    "timeout-seconds",
  ]);
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    const name = args[i]?.replace(/^--/, "");
    if (
      !args[i]?.startsWith("--") ||
      !allowed.has(name) ||
      values[name] !== undefined ||
      args[i + 1] === undefined
    )
      throw new Error("Invalid or duplicate smoke option");
    values[name] = args[i + 1];
  }
  const integer = (name, fallback, max) => {
    const raw = values[name] ?? String(fallback);
    if (!/^\d+$/.test(raw)) throw new Error(`Invalid ${name}`);
    const n = Number(raw);
    if (!Number.isSafeInteger(n) || n < 1 || n > max)
      throw new Error(`Invalid ${name}`);
    return n;
  };
  const network = values.network ?? "mainnet";
  if (!["mainnet", "sepolia"].includes(network))
    throw new Error("Invalid network");
  const pinned = values.from !== undefined || values.to !== undefined;
  if (
    pinned &&
    (values.from === undefined ||
      values.to === undefined ||
      values.recent !== undefined)
  )
    throw new Error("Provide both from/to or recent");
  const from = pinned ? integer("from", 1, Number.MAX_SAFE_INTEGER) : undefined;
  const to = pinned ? integer("to", 1, Number.MAX_SAFE_INTEGER - 1) : undefined;
  if (pinned && (to < from || to - from >= 1_000_000))
    throw new Error("Range must be ascending and at most 1,000,000 blocks");
  const maxCalls = integer("max-calls", 3, 20);
  if (!pinned && maxCalls < 2)
    throw new Error("Recent scan needs height and query calls");
  return {
    network,
    from,
    to,
    recent: pinned ? undefined : integer("recent", 2000, 1_000_000),
    maxCalls,
    maxEvents: integer("max-events", 20, 1000),
    chunkBlocks: integer("chunk-blocks", 10000, 100000),
    timeoutSeconds: integer("timeout-seconds", 60, 120),
  };
}

export function verifyTopicFilters(registrations, route) {
  const topic = (address) =>
    "0x" + BigInt(address).toString(16).padStart(64, "0");
  const expected = {
    LogMessageToL2: [[topic(route.l1BridgeAddress)], [], []],
    ConsumedMessageToL2: [
      [topic(route.l1BridgeAddress)],
      [topic(route.l2BridgeAddress)],
      [],
    ],
    LogMessageToL1: [
      [topic(route.l2BridgeAddress)],
      [topic(route.l1BridgeAddress)],
      [],
    ],
    ConsumedMessageToL1: [
      [topic(route.l2BridgeAddress)],
      [topic(route.l1BridgeAddress)],
      [],
    ],
  };
  if (
    registrations.length !== 4 ||
    new Set(registrations.map((r) => r.eventName)).size !== 4
  )
    throw new Error("Expected exactly four messaging events");
  for (const r of registrations) {
    const filter = r.topicSelections[0];
    if (
      r.isWildcard ||
      r.topicSelections.length !== 1 ||
      !expected[r.eventName] ||
      filter.topic0.length !== 1 ||
      filter.topic0[0] !== r.sighash ||
      JSON.stringify([filter.topic1, filter.topic2, filter.topic3]) !==
        JSON.stringify(expected[r.eventName])
    )
      throw new Error("Unsafe or unexpected messaging filter");
  }
}

export async function prepareNative(options, token) {
  if (typeof token !== "string" || !token.trim())
    throw new Error("ENVIO_API_TOKEN is required");
  process.env.ENVIO_CONFIG = `config.${options.network}.yaml`;
  const requireEnvio = createRequire(import.meta.resolve("envio"));
  requireEnvio("tsx/esm/api").register();
  const bridge = await import("@realms-world/bridge");
  const route = bridge.getBridgeNetworkConfig(options.network);
  if (options.from !== undefined && options.from < route.l1StartBlock)
    throw new Error("Range precedes bridge start block");
  const Config = await import("envio/src/Config.res.mjs");
  const HandlerRegister = await import("envio/src/HandlerRegister.res.mjs");
  const HyperSyncClient =
    await import("envio/src/sources/HyperSyncClient.res.mjs");
  const AddressStore = await import("envio/src/sources/AddressStore.res.mjs");
  const Evm = await import("envio/src/sources/Evm.res.mjs");
  const { eventTypes } = await import("../src/handlers/bridge.ts");
  const config = Config.load();
  HandlerRegister.startRegistration(config);
  const registrations = Object.keys(eventTypes)
    .flatMap((event) =>
      HandlerRegister.getSimulateOnEventRegistrations(
        config,
        route.l1ChainId,
        Config.getEventConfig(
          config,
          "StarknetMessaging",
          event,
          route.l1ChainId,
        ),
      ),
    )
    .map((registration, index) => ({ ...registration, index }));
  if (registrations.length !== 4 || registrations.some((r) => r.isWildcard))
    throw new Error("Expected four non-wildcard registrations");
  const nativeRegistrations =
    HyperSyncClient.Registration.fromOnEventRegistrations(registrations);
  verifyTopicFilters(nativeRegistrations, route);
  const addresses = AddressStore.make(
    "evm",
    false,
    AddressStore.contractsOf(registrations, config.contractMapping),
  );
  AddressStore.seedBatch(addresses, [
    {
      address: route.messagingAddress,
      contractName: "StarknetMessaging",
      registrationBlock: -1,
    },
  ]);
  const addressSet = AddressStore.makeSet(addresses, "StarknetMessaging");
  if (addressSet.size() !== 1)
    throw new Error("Expected exactly the messaging emitter");
  const client = HyperSyncClient.makeWithAgent(
    {
      url: `https://${route.l1ChainId}.hypersync.xyz`,
      apiToken: token,
      httpReqTimeoutMillis: 10000,
      enableChecksumAddresses: false,
      logLevel: "error",
    },
    "realms-bridge-bounded-smoke/1",
    nativeRegistrations,
    addresses,
  );
  const blockMask = Evm.eventBlockFieldMask(
    new Set(["number", "hash", "timestamp"]),
  );
  const txMask = Evm.eventTransactionFieldMask(new Set(["hash"]));
  return {
    route,
    nativeRegistrations,
    height: () => client.getHeight(),
    query: async (from, to, maxEvents) => {
      const [page, transactions, blocks] = await client.getEventItems(
        {
          fromBlock: from,
          toBlock: to,
          maxNumLogs: maxEvents,
          registrationIndexes: registrations.map((r) => r.index),
          clientFilteredContracts: undefined,
          includeAllBlocks: false,
        },
        addressSet,
      );
      const items = page.items.slice(0, maxEvents);
      const blockRows = await blocks.materialize(
        items.map((i) => i.blockNumber),
        items.map(() => blockMask),
      );
      const transactionRows = await transactions.materialize(
        items.map((i) => i.blockNumber),
        items.map((i) => i.transactionIndex),
        items.map(() => txMask),
      );
      const events = items.map((item, i) => {
        const eventName =
          registrations[item.onEventRegistrationIndex]?.eventConfig.name;
        if (
          !eventName ||
          item.srcAddress.toLowerCase() !== route.messagingAddress.toLowerCase()
        )
          throw new Error("Unexpected event route");
        const decoded = bridge.decodeBridgePayload(
          options.network,
          eventName.endsWith("ToL1") ? "withdrawal" : "deposit",
          item.params.payload,
        );
        return {
          eventName,
          blockNumber: item.blockNumber,
          blockHash: blockRows[i].hash,
          timestamp: blockRows[i].timestamp,
          transactionHash: transactionRows[i].hash,
          logIndex: item.logIndex,
          requestKey: decoded.requestKey,
          reqHash: decoded.reqHash,
          ownerL1: decoded.ownerL1,
          ownerL2: decoded.ownerL2,
          tokenIds: decoded.tokenIds,
          payload: decoded.payload,
        };
      });
      return {
        nextBlock: page.nextBlock,
        archiveHeight: page.archiveHeight,
        events,
        truncated: page.items.length > maxEvents,
      };
    },
  };
}

export async function runScan(options, source) {
  let calls = 0;
  let to = options.to;
  if (to === undefined) {
    to = await source.height();
    calls++;
  }
  if (!Number.isSafeInteger(to) || to < 1 || to >= Number.MAX_SAFE_INTEGER)
    throw new Error("Invalid source height");
  const from =
    options.from ??
    Math.max(source.route.l1StartBlock, to - options.recent + 1);
  if (from > to) throw new Error("Source head precedes start block");
  let cursor = from;
  const events = [];
  let truncated = false;
  while (
    cursor <= to &&
    calls < options.maxCalls &&
    events.length < options.maxEvents
  ) {
    const end = Math.min(to, cursor + options.chunkBlocks - 1);
    const page = await source.query(
      cursor,
      end,
      options.maxEvents - events.length,
    );
    calls++;
    if (
      !Number.isSafeInteger(page.nextBlock) ||
      page.nextBlock <= cursor ||
      page.nextBlock > end + 1
    )
      throw new Error("Invalid source pagination");
    events.push(...page.events.slice(0, options.maxEvents - events.length));
    truncated ||= page.truncated;
    cursor = page.nextBlock;
  }
  const complete = cursor > to && !truncated;
  return {
    network: options.network,
    fromBlock: from,
    toBlockInclusive: to,
    nextBlock: cursor,
    clientCalls: calls,
    eventCount: events.length,
    complete,
    stopReason: complete
      ? "range-complete"
      : truncated || events.length >= options.maxEvents
        ? "event-limit"
        : "call-limit",
    counts: Object.fromEntries(
      [
        "LogMessageToL2",
        "ConsumedMessageToL2",
        "LogMessageToL1",
        "ConsumedMessageToL1",
      ].map((name) => [
        name,
        events.filter((e) => e.eventName === name).length,
      ]),
    ),
    events,
  };
}

async function main() {
  if (process.argv.includes("--help")) {
    console.log(
      "node scripts/hypersync-smoke.mjs --network mainnet|sepolia [--from N --to N | --recent N] [--max-calls 3 --max-events 20 --chunk-blocks 10000 --timeout-seconds 60]\nToken: ENVIO_API_TOKEN from process environment only. to is inclusive. Native calls may internally retry; wall time is capped. No database writes or RPC.",
    );
    return;
  }
  const token = process.env.ENVIO_API_TOKEN; // Capture before framework imports.
  const options = parseOptions(process.argv.slice(2));
  if (!token?.trim()) throw new Error("ENVIO_API_TOKEN is required");
  const timer = setTimeout(() => {
    console.error(
      "Smoke stopped at wall-time limit; partial scans are not coverage proof.",
    );
    process.exit(1);
  }, options.timeoutSeconds * 1000);
  try {
    console.log(
      JSON.stringify(
        await runScan(options, await prepareNative(options, token)),
        null,
        2,
      ),
    );
  } finally {
    clearTimeout(timer);
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.chdir(fileURLToPath(new URL("..", import.meta.url)));
  main().catch(() => {
    console.error(
      "HyperSync smoke failed. Check token, bounded range, source availability and pinned API compatibility. No RPC fallback attempted.",
    );
    process.exitCode = 1;
  });
}
