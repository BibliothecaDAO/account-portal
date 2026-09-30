# Build from the repository root: docker build -f packages/hyperindex/Dockerfile .
FROM node:22.18.0-bookworm-slim
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /workspace
COPY --chown=node:node . .
RUN pnpm install --frozen-lockfile --filter @realms-world/hyperindex... \
    && pnpm --filter @realms-world/hyperindex codegen \
    && ENVIO_CONFIG=config.sepolia.yaml pnpm --filter @realms-world/hyperindex codegen \
    && pnpm --filter @realms-world/hyperindex typecheck \
    && node packages/hyperindex/scripts/check-handler-loading.mjs \
    && chown -R node:node /workspace
USER node
WORKDIR /workspace/packages/hyperindex
ENV NODE_ENV=production ENVIO_HASURA=false ENVIO_TUI=false
EXPOSE 8080
STOPSIGNAL SIGTERM
CMD ["node", "scripts/start.mjs"]
