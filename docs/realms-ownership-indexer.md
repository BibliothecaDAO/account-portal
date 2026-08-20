# Starknet Realm ownership indexer

The account portal reads Starknet Realm ownership from PostgreSQL. The
`strk-realms-ownership` Apibara indexer rebuilds that table from ERC-721
`Transfer` events, beginning immediately before mainnet block `664162`.

Apibara's Drizzle storage plugin records and reverses database writes during a
Starknet reorganisation. Transfers update the current owner, and transfers to
the zero address remove burned tokens. The indexer also maintains a checkpoint
that lets the UI distinguish initial sync, healthy, and stale data.

## Configuration

The indexer requires these server-side environment variables:

- `DATABASE_URL`: the same PostgreSQL database used by the account portal.
- `DNA_TOKEN`: a token from the DAO-owned Apibara account. It is not a wallet
  key and must never be committed or exposed through a `VITE_` variable.
- `VITE_PUBLIC_CHAIN=mainnet` for production.

The portal can use `VITE_PUBLIC_NODE_URL` for uncached on-chain Realm metadata.
This is a read-only RPC URL; it is not a wallet credential.

## Deploy

1. Apply the schema with `pnpm db:push` against the target database.
2. Build the indexers with `pnpm apibara:build`.
3. Start the ownership indexer with
   `pnpm --filter @realms-world/apibara start --indexer strk-realms-ownership`.
4. Wait until the initial replay reaches the current Starknet block. Account
   screens intentionally show a syncing message until then.
5. Redeploy the account portal against the same `DATABASE_URL`.
6. Run `pnpm --filter @realms-world/apibara ownership:smoke`.

For an ownership assertion, set `REALM_OWNERSHIP_SMOKE_ADDRESS` and
`REALM_OWNERSHIP_SMOKE_EXPECTED_COUNT` before running the smoke test. The known
incident wallet can therefore be checked for exactly 17 records without
hard-coding a personal address in the repository.

## Local verification

Use a local or development PostgreSQL database, apply `pnpm db:push`, then start
the indexer and portal in separate terminals. Once the indexer reports a current
block, open `/realms` or `/realms/bridge` and connect the Starknet wallet in the
browser. No wallet private key or wallet API key belongs in the environment.
