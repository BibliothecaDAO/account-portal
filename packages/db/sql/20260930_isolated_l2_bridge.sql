-- Apply explicitly to an isolated database first. No legacy or HyperIndex DDL.
BEGIN;
CREATE TABLE public.l2_bridge_requests (
  _id text PRIMARY KEY, network text NOT NULL, direction text NOT NULL,
  req_hash text NOT NULL, owner_l1 text NOT NULL, owner_l2 text NOT NULL,
  token_ids text[] NOT NULL, payload text[] NOT NULL
);
CREATE TABLE public.l2_bridge_events (
  _id text PRIMARY KEY, request_key text NOT NULL,
  network text NOT NULL, direction text NOT NULL,
  req_hash text NOT NULL, owner_l1 text NOT NULL, owner_l2 text NOT NULL,
  token_ids text[] NOT NULL, payload text[] NOT NULL,
  source_chain text NOT NULL, event_name text NOT NULL, type text NOT NULL,
  block_number numeric NOT NULL, block_hash text NOT NULL,
  transaction_hash text NOT NULL, log_index integer NOT NULL,
  timestamp timestamptz NOT NULL
);
CREATE INDEX l2_bridge_events_request ON public.l2_bridge_events(request_key);
CREATE INDEX l2_bridge_events_owner_l1 ON public.l2_bridge_events(network, owner_l1);
CREATE INDEX l2_bridge_events_owner_l2 ON public.l2_bridge_events(network, owner_l2);
CREATE TABLE public.l2_bridge_progress (
  _id text PRIMARY KEY, network text NOT NULL, source_chain text NOT NULL,
  block_number numeric NOT NULL, block_hash text NOT NULL,
  block_timestamp timestamptz NOT NULL, observed_at timestamptz NOT NULL,
  production text NOT NULL
);
COMMIT;
