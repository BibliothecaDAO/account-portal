# Account Portal application

This package contains the TanStack Start account portal. Environment variables
are loaded from the repository root so there is one canonical configuration.

From the repository root:

```sh
cp .env.example .env
pnpm install
pnpm dev
```

See the root [README](../../README.md) for validation, migrations, and
production deployment requirements. `VITE_TORII_API_URL` must point at the
active Torii deployment for the configured chain; there is no baked-in
deployment fallback.
