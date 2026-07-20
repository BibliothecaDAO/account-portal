import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const velords_rewards_received = pgTable("velords_rewards_received", {
  _id: text("_id").notNull().primaryKey(),
  sender: text("sender").notNull(),
  amount: numeric("amount").notNull(),
  transaction_hash: text("transaction_hash").notNull(),
  timestamp: timestamp("epoch", {
    mode: "date",
    precision: 3,
  }).notNull(),
});

export const velords_lords_locked = pgTable("velords_lords_locked", {
  _id: text("_id").notNull().primaryKey(),
  owner: text("owner").notNull(),
  amount: numeric("amount").notNull(),
  transaction_hash: text("transaction_hash").notNull(),
  timestamp: timestamp("epoch", {
    mode: "date",
    precision: 3,
  }).notNull(),
  end_time: integer("end_time"),
});
export const velords_burner_transfers = pgTable("velords_burner_transfers", {
  _id: text("_id").notNull().primaryKey(),
  sender: text("sender").notNull(),
  amount: numeric("amount").notNull(),
  transaction_hash: text("transaction_hash").notNull(),
  timestamp: timestamp("timestamp", {
    mode: "date",
    precision: 3,
  }).notNull(),
});
