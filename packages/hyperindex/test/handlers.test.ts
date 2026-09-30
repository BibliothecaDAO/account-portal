// Synthetic fixtures: these exercise decoding/filtering, not independent chain evidence.
import { createTestIndexer } from "envio";
import { describe, expect, it } from "vitest";

import { getBridgeNetworkConfig } from "@realms-world/bridge";

import "../src/handlers/bridge";

const network = process.env.ENVIO_CONFIG?.includes("sepolia")
  ? "sepolia"
  : "mainnet";
const config = getBridgeNetworkConfig(network);
const block = {
  number: config.l1StartBlock,
  hash: `0x${"a".repeat(64)}`,
  timestamp: 1720000000,
};
const transaction = { hash: `0x${"b".repeat(64)}` };
const payload = [12n, 1n, 0x123n, 0x456n, 1n, 42n, 0n];
const toL2 = {
  fromAddress: config.l1BridgeAddress,
  toAddress: BigInt(config.l2BridgeAddress),
  selector: 1n,
  payload,
  nonce: 3n,
  fee: 0n,
};
const toL1 = {
  fromAddress: BigInt(config.l2BridgeAddress),
  toAddress: config.l1BridgeAddress,
  payload,
};

describe("HyperIndex bridge handlers", () => {
  it("stores all four compatible event types with lossless evidence and distinct log identities", async () => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: {
        [config.l1ChainId]: {
          simulate: [
            {
              contract: "StarknetMessaging",
              event: "LogMessageToL2",
              params: toL2,
              block,
              transaction,
              logIndex: 0,
            },
            {
              contract: "StarknetMessaging",
              event: "ConsumedMessageToL2",
              params: toL2,
              block,
              transaction,
              logIndex: 1,
            },
            {
              contract: "StarknetMessaging",
              event: "LogMessageToL1",
              params: toL1,
              block,
              transaction,
              logIndex: 2,
            },
            {
              contract: "StarknetMessaging",
              event: "ConsumedMessageToL1",
              params: toL1,
              block,
              transaction,
              logIndex: 3,
            },
          ],
        },
      },
    });
    const events = await indexer.L1BridgeEvent.getAll();
    expect(events).toHaveLength(4);
    expect(new Set(events.map((e) => e.id)).size).toBe(4);
    expect(new Set(events.map((e) => e.request_key)).size).toBe(2);
    expect(events.map((e) => e.type).sort()).toEqual(
      [
        "deposit_initiated_l1",
        "withdraw_available_l1",
        "withdraw_completed_l1",
        "withdraw_completed_l2",
      ].sort(),
    );
    for (const event of events) {
      expect(event.payload).toEqual(payload.map(String));
      expect(event.token_ids).toEqual(["42"]);
      expect(event.req_hash).toBe(((1n << 128n) + 12n).toString());
      expect(event.owner_l1).toMatch(/123$/);
      expect(event.owner_l2).toMatch(/456$/);
      expect(event.block_number).toBe(BigInt(block.number));
      expect(event.timestamp).toEqual(new Date(block.timestamp * 1000));
      expect(event.source_chain).toBe(String(config.l1ChainId));
    }
  });

  it("preserves unrestricted LogMessageToL2 destination and selector", async () => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: {
        [config.l1ChainId]: {
          simulate: [
            {
              contract: "StarknetMessaging",
              event: "LogMessageToL2",
              params: { ...toL2, toAddress: 99n, selector: 99n },
              block,
              transaction,
            },
          ],
        },
      },
    });
    expect(await indexer.L1BridgeEvent.getAll()).toHaveLength(1);
  });

  const excluded = [
    {
      event: "LogMessageToL2",
      params: {
        ...toL2,
        fromAddress: "0x0000000000000000000000000000000000000001",
      },
    },
    { event: "ConsumedMessageToL2", params: { ...toL2, toAddress: 99n } },
    { event: "LogMessageToL1", params: { ...toL1, fromAddress: 99n } },
    {
      event: "ConsumedMessageToL1",
      params: {
        ...toL1,
        toAddress: "0x0000000000000000000000000000000000000001",
      },
    },
    {
      event: "LogMessageToL2",
      srcAddress: "0x0000000000000000000000000000000000000001",
      params: toL2,
    },
  ] as const;
  for (const [i, item] of excluded.entries()) {
    it(`rejects unrelated route/emitter fixture ${i}`, async () => {
      const indexer = createTestIndexer();
      // v3 simulation rejects unregistered emitters; static topic filters use our guard.
      const processing = indexer.process({
        chains: {
          [config.l1ChainId]: {
            simulate: [
              { contract: "StarknetMessaging", ...item, block, transaction },
            ],
          },
        },
      });
      if ("srcAddress" in item)
        await expect(processing).rejects.toThrow(/never reached a handler/);
      else await processing;
      expect(await indexer.L1BridgeEvent.getAll()).toHaveLength(0);
    });
  }

  it("rejects conflicting owners for the same logical request", async () => {
    const indexer = createTestIndexer();
    await expect(
      indexer.process({
        chains: {
          [config.l1ChainId]: {
            simulate: [
              {
                contract: "StarknetMessaging",
                event: "LogMessageToL2",
                params: toL2,
                block,
                transaction,
                logIndex: 0,
              },
              {
                contract: "StarknetMessaging",
                event: "ConsumedMessageToL2",
                params: {
                  ...toL2,
                  payload: [12n, 1n, 0x999n, 0x456n, 1n, 42n, 0n],
                },
                block,
                transaction,
                logIndex: 1,
              },
            ],
          },
        },
      }),
    ).rejects.toThrow(/Invalid bridge event/);
  });

  it("fails with transaction provenance on malformed matching payloads", async () => {
    const indexer = createTestIndexer();
    await expect(
      indexer.process({
        chains: {
          [config.l1ChainId]: {
            simulate: [
              {
                contract: "StarknetMessaging",
                event: "LogMessageToL2",
                params: { ...toL2, payload: [1n] },
                block,
                transaction,
              },
            ],
          },
        },
      }),
    ).rejects.toThrow(/Invalid bridge event/);
    expect(await indexer.L1BridgeEvent.getAll()).toHaveLength(0);
  });
});
