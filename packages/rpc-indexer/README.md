# @realms-world/rpc-indexer

Direct JSON-RPC replacement for the Apibara indexers. The design, phases and
acceptance gates are in
[the migration plan](../../docs/direct-rpc-indexer-migration-plan.md).

This package currently holds the Phase 0 and Phase 1 slice. No worker, schema
or reader selection exists yet, and nothing here writes to a database.

| Path                       | Contents                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/rpc/json-rpc.ts`      | JSON-RPC transport: deadlines, bounded retries with jitter, throttling inside HTTP 200, URL-free errors                    |
| `src/chains/starknet.ts`   | Starknet v0.10 reader: hash-pinned ranges, verified pagination, explicit transaction-local positions, typed failures       |
| `src/decoders/starknet.ts` | Pure decoders for `Transfer`, `RewardClaimed`, `ModifyLock`, `RewardReceived` and both bridge request events               |
| `src/decoders/legacy.ts`   | The value formats the current Apibara tables use (padded felts for claims and veLORDS, unpadded owners), for parity checks |
| `src/config.ts`            | Network manifest: contract addresses from `@realms-world/constants`, inclusive start blocks, Starknet grouping, env schema |
| `scripts/probe.ts`         | Bounded, read-only capability probe                                                                                        |

## Capability probe

The probe checks spec version, chain ID, accepted and `l1_accepted` heads,
block cadence, whether a query pinned to an unknown block hash fails, real
event positions for every filter (checked against the transaction receipt),
pagination, address-list parity and whether the endpoint caps block ranges.
It stops after `PROBE_MAX_CALLS` attempts (default 250) and prints JSON
without the endpoint URL.

```sh
pnpm --filter @realms-world/rpc-indexer build
RPC_INDEXER_NETWORK=mainnet STARKNET_RPC_URL=<alchemy v0_10 url> \
  pnpm --filter @realms-world/rpc-indexer probe
```

Record the results in the plan's Phase 0 section. They decide the Starknet
query mode (`address-list` or `individual`), and therefore the grouping, and
whether the hash-pinned read cycle can be used.

## Development

```sh
pnpm --filter @realms-world/rpc-indexer test
pnpm --filter @realms-world/rpc-indexer typecheck
pnpm --filter @realms-world/rpc-indexer lint
```

No Ekubo source has been copied. If any is adapted later, add its MIT notice
and pinned revision in `THIRD_PARTY_NOTICES.md`.
