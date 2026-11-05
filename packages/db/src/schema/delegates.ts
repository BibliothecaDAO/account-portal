import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const DELEGATES_INDEXER_ID = "starknet-delegates";

/** Current state per delegate. `_id` and `address` are the 0x + 64 hex form profiles use. */
export const starknetDelegates = pgTable(
  "starknet_delegates",
  {
    _id: text("_id").notNull().primaryKey(),
    address: text("address").notNull(),
    votes: numeric("votes", { precision: 78, scale: 0 }).notNull(),
    token_holders_represented: integer("token_holders_represented").notNull(),
    last_block_number: numeric("last_block_number", { scale: 0 }).notNull(),
    last_event_index: integer("last_event_index").notNull(),
    last_transaction_hash: text("last_transaction_hash").notNull(),
  },
  (table) => [index("starknet_delegates_votes_idx").on(table.votes)],
);

/** Delegator to delegate. `delegate` is null once a delegator has undelegated. */
export const starknetDelegators = pgTable(
  "starknet_delegators",
  {
    _id: text("_id").notNull().primaryKey(),
    delegator: text("delegator").notNull(),
    delegate: text("delegate"),
    last_block_number: numeric("last_block_number", { scale: 0 }).notNull(),
    last_event_index: integer("last_event_index").notNull(),
    last_transaction_hash: text("last_transaction_hash").notNull(),
  },
  (table) => [index("starknet_delegators_delegate_idx").on(table.delegate)],
);

export const starknetDelegatesStatus = pgTable("starknet_delegates_status", {
  _id: text("_id").notNull().primaryKey(),
  latest_block_number: numeric("latest_block_number", { scale: 0 }).notNull(),
  latest_block_timestamp: timestamp("latest_block_timestamp", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  last_processed_at: timestamp("last_processed_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  has_reached_head: boolean("has_reached_head").notNull().default(false),
});
