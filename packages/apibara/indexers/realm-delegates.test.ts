import { readFile } from "node:fs/promises";
import { decodeEvent, getSelector } from "@apibara/starknet";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  starknetDelegates,
  starknetDelegatesStatus,
  starknetDelegators,
} from "@realms-world/db/schema";

import {
  applyDelegateChange,
  applyDelegateVotesChange,
  recordDelegatesProgress,
  toDelegateAddress,
  toDelegateChange,
  toDelegateVotesChange,
} from "./realm-delegates";
import {
  DELEGATE_CHANGED_EVENT,
  DELEGATE_VOTES_CHANGED_EVENT,
  REALMS_DELEGATES_ABI,
} from "./realms-delegates-abi";

const pad = (hex: string) => `0x${hex.padStart(64, "0")}`;
const [ALICE, BOB, CAROL] = [pad("a"), pad("b"), pad("c")] as [
  string,
  string,
  string,
];
const location = { blockNumber: 700_000n, eventIndex: 2 };

const change = (
  delegator: string,
  fromDelegate: string | null,
  toDelegate: string | null,
  blockNumber: string,
  eventIndex = 0,
) => ({
  delegator,
  fromDelegate,
  toDelegate,
  blockNumber,
  eventIndex,
  transactionHash: "0xabc",
});
const votes = (
  delegate: string,
  value: string,
  blockNumber: string,
  eventIndex = 0,
) => ({
  delegate,
  votes: value,
  blockNumber,
  eventIndex,
  transactionHash: "0xabc",
});

describe("delegate event normalisation", () => {
  it("pads addresses to the form saved profiles use and nulls the zero address", () => {
    expect(toDelegateAddress("0xA")).toBe(ALICE);
    expect(toDelegateAddress(0n)).toBeNull();
  });

  it("decodes the raw DelegateChanged key layout", () => {
    const decoded = decodeEvent({
      abi: REALMS_DELEGATES_ABI,
      eventName: DELEGATE_CHANGED_EVENT,
      event: {
        keys: [getSelector("DelegateChanged"), "0xa", "0x0", "0xb"],
        data: [],
        transactionHash: "0xabc",
      } as never,
    });
    expect(toDelegateChange(decoded, location)).toEqual({
      delegator: ALICE,
      fromDelegate: null,
      toDelegate: BOB,
      blockNumber: "700000",
      eventIndex: 2,
      transactionHash: "0xabc",
    });
  });

  it("decodes the raw DelegateVotesChanged layout without losing u256 precision", () => {
    const decoded = decodeEvent({
      abi: REALMS_DELEGATES_ABI,
      eventName: DELEGATE_VOTES_CHANGED_EVENT,
      event: {
        keys: [getSelector("DelegateVotesChanged"), "0xb"],
        data: ["0x1", "0x0", "0x7", "0x1"],
        transactionHash: "0xabc",
      } as never,
    });
    expect(toDelegateVotesChange(decoded, location)).toMatchObject({
      delegate: BOB,
      votes: "340282366920938463463374607431768211463",
    });
  });

  it("rejects a malformed decoded event", () => {
    expect(() =>
      toDelegateChange({ transactionHash: "0x1", args: {} }, location),
    ).toThrow(TypeError);
  });

  it("matches the events in the full Realms ABI", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
    vi.stubEnv("VITE_PUBLIC_CHAIN", "mainnet");
    const { REALMS_ABI } = await import("./strk-realms-lords-claims.indexer");
    vi.unstubAllEnvs();
    for (const name of [DELEGATE_CHANGED_EVENT, DELEGATE_VOTES_CHANGED_EVENT]) {
      const pick = (abi: readonly unknown[]) =>
        abi.find((entry) => (entry as { name: string }).name === name);
      expect(pick(REALMS_DELEGATES_ABI)).toEqual(pick(REALMS_ABI));
    }
  });
});

describe("delegate state", () => {
  let client: PGlite;
  let database: ReturnType<typeof createDatabase>;
  const createDatabase = (pglite: PGlite) => drizzle(pglite);

  const delegate = async (address: string) => {
    const rows = await database
      .select()
      .from(starknetDelegates)
      .where(eq(starknetDelegates._id, address));
    return rows.at(0);
  };

  beforeEach(async () => {
    client = new PGlite();
    await client.exec(
      await readFile(
        new URL("../../db/sql/20261105_starknet_delegates.sql", import.meta.url),
        "utf8",
      ),
    );
    database = createDatabase(client);
  });
  afterEach(() => client.close());

  it("sets votes to the event's absolute value", async () => {
    await applyDelegateVotesChange(database, votes(BOB, "5", "1"));
    await applyDelegateVotesChange(database, votes(BOB, "3", "2"));
    expect(await delegate(BOB)).toMatchObject({
      votes: "3",
      address: BOB,
      token_holders_represented: 0,
      last_block_number: "2",
    });
  });

  it("does not let a replayed older votes event overwrite newer state", async () => {
    await applyDelegateVotesChange(database, votes(BOB, "5", "10", 4));
    await applyDelegateVotesChange(database, votes(BOB, "1", "10", 3));
    await applyDelegateVotesChange(database, votes(BOB, "2", "9", 9));
    expect((await delegate(BOB))?.votes).toBe("5");
  });

  it("orders votes numerically beyond the bigint range", async () => {
    await applyDelegateVotesChange(database, votes(BOB, "9", "1"));
    await applyDelegateVotesChange(
      database,
      votes(CAROL, (2n ** 256n - 1n).toString(), "1"),
    );
    const { rows } = await client.query<{ _id: string }>(
      "SELECT _id FROM starknet_delegates ORDER BY votes DESC",
    );
    expect(rows.map((row) => row._id)).toEqual([CAROL, BOB]);
  });

  it("counts holders, moves them on redelegation and drops them on undelegation", async () => {
    await applyDelegateChange(database, change(ALICE, null, BOB, "1"));
    await applyDelegateChange(database, change(CAROL, null, BOB, "1", 1));
    expect((await delegate(BOB))?.token_holders_represented).toBe(2);

    await applyDelegateChange(database, change(ALICE, BOB, CAROL, "2"));
    expect((await delegate(BOB))?.token_holders_represented).toBe(1);
    expect((await delegate(CAROL))?.token_holders_represented).toBe(1);

    await applyDelegateChange(database, change(ALICE, CAROL, null, "3"));
    expect((await delegate(CAROL))?.token_holders_represented).toBe(0);
    expect(await database.select().from(starknetDelegators)).toContainEqual(
      expect.objectContaining({ delegator: ALICE, delegate: null }),
    );
  });

  it("creates a zero-vote row for a delegate gaining a holder with no votes", async () => {
    await applyDelegateChange(database, change(ALICE, null, BOB, "1"));
    expect(await delegate(BOB)).toMatchObject({
      votes: "0",
      token_holders_represented: 1,
    });
  });

  it("does not disturb votes when the holder count changes", async () => {
    await applyDelegateVotesChange(database, votes(BOB, "7", "1"));
    await applyDelegateChange(database, change(ALICE, null, BOB, "2"));
    expect(await delegate(BOB)).toMatchObject({
      votes: "7",
      token_holders_represented: 1,
      last_block_number: "2",
    });
  });

  it("is unchanged by replaying the same and older delegate changes", async () => {
    await applyDelegateChange(database, change(ALICE, null, BOB, "1"));
    await applyDelegateChange(database, change(ALICE, BOB, CAROL, "2"));
    await applyDelegateChange(database, change(ALICE, BOB, CAROL, "2"));
    await applyDelegateChange(database, change(ALICE, null, BOB, "1"));

    expect((await delegate(BOB))?.token_holders_represented).toBe(0);
    expect((await delegate(CAROL))?.token_holders_represented).toBe(1);
  });

  it("removes the holder from the mapped delegate even if the event names another", async () => {
    await applyDelegateChange(database, change(ALICE, null, BOB, "1"));
    await applyDelegateChange(database, change(ALICE, null, CAROL, "2"));
    expect((await delegate(BOB))?.token_holders_represented).toBe(0);
  });

  it("never writes a row for the zero address", async () => {
    await applyDelegateVotesChange(database, {
      ...votes(BOB, "1", "1"),
      delegate: null,
    });
    expect(await database.select().from(starknetDelegates)).toEqual([]);
  });

  it("keeps has_reached_head once it has been reached", async () => {
    const now = new Date("2026-11-05T00:00:00Z");
    const old = new Date("2024-01-01T00:00:00Z");
    const record = (blockNumber: bigint, blockTimestamp: Date) =>
      recordDelegatesProgress(database, {
        blockNumber,
        blockTimestamp,
        processedAt: now,
      });

    await record(1n, old);
    expect(await database.select().from(starknetDelegatesStatus)).toMatchObject(
      [{ latest_block_number: "1", has_reached_head: false }],
    );
    await record(2n, now);
    await record(3n, old);
    expect(await database.select().from(starknetDelegatesStatus)).toMatchObject(
      [{ latest_block_number: "3", has_reached_head: true }],
    );
  });
});
