<a href="https://twitter.com/lootrealms">
<img src="https://img.shields.io/twitter/follow/lootrealms?style=social"/>
</a>
<a href="https://twitter.com/BibliothecaDAO">
<img src="https://img.shields.io/twitter/follow/BibliothecaDAO?style=social"/>
</a>

[![discord](https://img.shields.io/badge/join-bibliothecadao-black?logo=discord&logoColor=white)](https://discord.gg/realmsworld)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# Realms.World Account Portal

## Account portal

[Realms.World](https://realms.world) is the central hub for the Realms
Autonomous World. This repository contains the account portal and its indexers.
Features include:

- Realms Bridge (Ethereum <> Starknet)
- Realms rewards and VeLords functionality
- Governance (delegation and voting)

## Local development

Prerequisites are Node.js 22.12 or newer and pnpm 10.30.3.

```sh
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

The root `.env.example` is the canonical environment template. Keep secrets in
server-only variables such as `ALCHEMY_API_KEY`, `ETHPLORER_API_KEY`, and
`BETTER_AUTH_SECRET`; variables prefixed with `VITE_PUBLIC_` are shipped to the
browser. Production requires an HTTPS `VITE_BASE_URL`, the active Torii
deployment in `VITE_TORII_API_URL`, and a unique `BETTER_AUTH_SECRET` of at
least 32 characters.

## Validation

Run the same quality gate used by CI:

```sh
pnpm check
```

This runs linting, strict type checking, tests, the application/indexer builds,
the frontend bundle budget, and an HTTP smoke test against the production
server artifact.

## Production deployment

Apply checked-in migrations once per environment before rolling out the new
application and indexers:

```sh
pnpm db:migrate
```

The migration runner uses a PostgreSQL advisory lock, records checksums, and is
safe to run from one deployment job at a time. Do not use `db:push` for
production releases. After deployment, verify `GET /api/health` returns a 200
response with `{"status":"ok"}`.

## Contributing

We welcome focused contributions. Keep the worktree passing `pnpm check` and
include tests for behavior changes.

## License

Realms.World is released under the MIT License.
