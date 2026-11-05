import { readFile } from "node:fs/promises";
import type { Client } from "@apibara/protocol";
import { createIndexer as instantiateIndexer, run } from "@apibara/indexer";
import { internalContext } from "@apibara/indexer/internal/plugins";
import { logger } from "@apibara/indexer/plugins";
import { MockClient } from "@apibara/protocol/testing";
import { getSelector } from "@apibara/starknet";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  starknetDelegates,
  starknetDelegatesStatus,
  starknetDelegators,
} from "@realms-world/db/schema";

const pad = (hex: string) => `0x${hex.padStart(64, "0")}`;

describe("Starknet delegates indexer", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
    vi.unstubAllEnvs();
  });

  it("applies events, rolls back a reorg and replaces pending data through the real plugin", async () => {
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://test:test@localhost:5432/realms_test",
    );
    vi.stubEnv("VITE_PUBLIC_CHAIN", "mainnet");
    const { createIndexer } = await import("./strk-delegates.indexer");

    client = new PGlite();
    await client.exec(
      await readFile(
        new URL("../../db/sql/20261105_starknet_delegates.sql", import.meta.url),
        "utf8",
      ),
    );
    await client.exec(
      `CREATE TABLE delegates (id text); INSERT INTO delegates VALUES ('frozen');`,
    );
    const database = drizzle(client, {
      schema: { starknetDelegates, starknetDelegators, starknetDelegatesStatus },
    });
    const config = createIndexer({ database });
    expect(config.startingCursor?.orderKey).toBe(664_161n);

    const delegateChanged = (
      delegator: string,
      from: string,
      to: string,
      eventIndex: number,
    ) => ({
      keys: [getSelector("DelegateChanged"), delegator, from, to],
      data: [],
      transactionHash: "0xabc",
      eventIndex,
    });
    const votesChanged = (
      delegate: string,
      previous: string,
      next: string,
      eventIndex: number,
    ) => ({
      keys: [getSelector("DelegateVotesChanged"), delegate],
      data: [previous, "0x0", next, "0x0"],
      transactionHash: "0xabc",
      eventIndex,
    });
    const data = (height: bigint, hash: string, events: unknown[]) => ({
      _tag: "data",
      data: {
        cursor: { orderKey: height - 1n },
        endCursor: { orderKey: height, uniqueKey: hash },
        finality: "accepted",
        production: "live",
        data: [
          {
            header: {
              blockNumber: height,
              blockHash: hash,
              timestamp: new Date(),
            },
            events,
          },
        ],
      },
    });
    const execute = async (messages: unknown[]) => {
      const indexer = instantiateIndexer({
        ...config,
        plugins: [
          logger({
            logger: {
              log() {
                /* Keep runtime test output quiet. */
              },
              info() {
                /* Keep runtime test output quiet. */
              },
            } as never,
          }),
          internalContext({
            indexerName: "delegates-test",
            availableIndexers: ["delegates-test"],
          }),
          ...(config.plugins ?? []),
        ],
      });
      await run(
        new MockClient(() => messages as never) as Client<
          typeof config.filter,
          Parameters<typeof config.transform>[0]["block"]
        >,
        indexer,
      );
    };
    const delegates = () =>
      database
        .select({
          address: starknetDelegates.address,
          votes: starknetDelegates.votes,
          holders: starknetDelegates.token_holders_represented,
        })
        .from(starknetDelegates)
        .orderBy(starknetDelegates.address);

    await execute([
      data(664_162n, "0x100", [
        delegateChanged("0xa", "0x0", "0xb", 0),
        votesChanged("0xb", "0x0", "0x3", 1),
      ]),
      data(664_163n, "0x101", [
        delegateChanged("0xa", "0xb", "0xc", 0),
        votesChanged("0xb", "0x3", "0x0", 1),
        votesChanged("0xc", "0x0", "0x3", 2),
      ]),
    ]);
    expect(await delegates()).toEqual([
      { address: pad("b"), votes: "0", holders: 0 },
      { address: pad("c"), votes: "3", holders: 1 },
    ]);

    // A reorg back to 664162 restores the earlier state, including the removed row.
    await execute([
      {
        _tag: "invalidate",
        invalidate: { cursor: { orderKey: 664_162n, uniqueKey: "0x100" } },
      },
    ]);
    expect(await delegates()).toEqual([
      { address: pad("b"), votes: "3", holders: 1 },
    ]);
    expect(await database.select().from(starknetDelegators)).toMatchObject([
      { delegator: pad("a"), delegate: pad("b") },
    ]);
    expect(await database.select().from(starknetDelegatesStatus)).toMatchObject(
      [{ latest_block_number: "664162" }],
    );

    // The replacement branch applies, with an empty block still advancing progress.
    await execute([
      data(664_163n, "0x102", [votesChanged("0xb", "0x3", "0x4", 0)]),
      data(664_164n, "0x103", []),
    ]);
    expect(await delegates()).toEqual([
      { address: pad("b"), votes: "4", holders: 1 },
    ]);
    expect(await database.select().from(starknetDelegatesStatus)).toMatchObject(
      [{ latest_block_number: "664164" }],
    );

    // A pending block is replaced by the accepted version of the same height.
    const pending = data(664_165n, "0x0", [
      delegateChanged("0xd", "0x0", "0xb", 5),
      votesChanged("0xb", "0x4", "0x9", 6),
    ]);
    pending.data.finality = "pending";
    await execute([
      pending,
      data(664_165n, "0x104", [votesChanged("0xb", "0x4", "0x5", 0)]),
    ]);
    expect(await delegates()).toEqual([
      { address: pad("b"), votes: "5", holders: 1 },
    ]);

    expect((await client.query("SELECT * FROM delegates")).rows).toEqual([
      { id: "frozen" },
    ]);
  }, 30_000);
});
