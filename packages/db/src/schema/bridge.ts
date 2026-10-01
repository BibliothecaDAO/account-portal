import { relations } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const bridgeEventTypeEnum = pgEnum("BridgeEventType", [
  "deposit_initiated_l1",
  "deposit_initiated_l2",
  "withdraw_available_l1",
  "withdraw_completed_l1",
  "withdraw_completed_l2",
]);

export const realmsBridgeRequests = pgTable("realms_bridge_requests", {
  _id: text("_id").notNull().primaryKey(),
  from_chain: text("from_chain").notNull(),
  token_ids: integer("token_ids").array().notNull(),
  from_address: text("from_address").notNull(),
  to_address: text("to_address").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  tx_hash: text("tx_hash").notNull(),
  req_hash: numeric("req_hash").notNull(),
});

export const realmsBridgeRequestsRelations = relations(
  realmsBridgeRequests,
  ({ many }) => ({
    events: many(realmsBridgeEvents),
  }),
);
export const realmsBridgeEvents = pgTable(
  "realms_bridge_events",
  {
    _id: text("_id").notNull(),
    hash: text("hash").notNull(),
    type: bridgeEventTypeEnum().notNull(),
    timestamp: timestamp("timestamp").notNull(),
  },
  (t) => [primaryKey({ columns: [t._id, t.type] })],
);
export const realmsBridgeEventsRelations = relations(
  realmsBridgeEvents,
  ({ one }) => ({
    request: one(realmsBridgeRequests, {
      fields: [realmsBridgeEvents._id],
      references: [realmsBridgeRequests._id],
    }),
  }),
);

export const realmsLordsClaims = pgTable(
  "realms_lords_claims",
  {
    _id: text("_id"),
    hash: text("hash").notNull(),
    amount: numeric("amount", { scale: 0 }).notNull(),
    recipient: text("recipient").notNull(),
    timestamp: timestamp({ mode: "string" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.amount, t.hash] })],
);

// Apibara alone owns these tables. HyperIndex entities are deliberately absent
// from this schema entrypoint so Drizzle cannot generate their DDL.
export const l2BridgeRequests = pgTable("l2_bridge_requests", {
  _id: text("_id").primaryKey(),
  network: text("network").notNull(),
  direction: text("direction").notNull(),
  req_hash: text("req_hash").notNull(),
  owner_l1: text("owner_l1").notNull(),
  owner_l2: text("owner_l2").notNull(),
  token_ids: text("token_ids").array().notNull(),
  payload: text("payload").array().notNull(),
});

export const l2BridgeEvents = pgTable(
  "l2_bridge_events",
  {
    _id: text("_id").primaryKey(),
    request_key: text("request_key").notNull(),
    network: text("network").notNull(),
    direction: text("direction").notNull(),
    req_hash: text("req_hash").notNull(),
    owner_l1: text("owner_l1").notNull(),
    owner_l2: text("owner_l2").notNull(),
    token_ids: text("token_ids").array().notNull(),
    payload: text("payload").array().notNull(),
    source_chain: text("source_chain").notNull(),
    event_name: text("event_name").notNull(),
    type: text("type").notNull(),
    block_number: numeric("block_number", { scale: 0 }).notNull(),
    block_hash: text("block_hash").notNull(),
    transaction_hash: text("transaction_hash").notNull(),
    log_index: integer("log_index").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("l2_bridge_events_request").on(t.request_key),
    index("l2_bridge_events_owner_l1").on(t.network, t.owner_l1),
    index("l2_bridge_events_owner_l2").on(t.network, t.owner_l2),
  ],
);

export const l2BridgeProgress = pgTable("l2_bridge_progress", {
  _id: text("_id").primaryKey(),
  network: text("network").notNull(),
  source_chain: text("source_chain").notNull(),
  block_number: numeric("block_number", { scale: 0 }).notNull(),
  block_hash: text("block_hash").notNull(),
  block_timestamp: timestamp("block_timestamp", {
    withTimezone: true,
  }).notNull(),
  observed_at: timestamp("observed_at", { withTimezone: true }).notNull(),
  // Comes from DNA's production mode, never inferred from bridge activity.
  production: text("production").notNull(),
});
