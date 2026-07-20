import { randomUUID } from "node:crypto";
import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { RpcProvider, verifyMessageInStarknet } from "starknet";
import { z } from "zod";

import { and, eq, verification as verificationTable } from "@realms-world/db";
import { db } from "@realms-world/db/client";
import { SiwsTypedData } from "@realms-world/siws";

import type { SiwsNonceStore } from "./siws-security";
import { StarknetAddressSchema } from "../../lib/validation/chain-address";
import {
  consumeSiwsNonce,
  issueSiwsNonce,
  isTrustedSiwsOrigin,
  toPublicSiwsError,
} from "./siws-security";

const nonceStore: SiwsNonceStore = {
  take: async (identifier, expectedValue) => {
    const [record] = await db
      .delete(verificationTable)
      .where(
        and(
          eq(verificationTable.identifier, identifier),
          eq(verificationTable.value, expectedValue),
        ),
      )
      .returning({
        id: verificationTable.id,
        value: verificationTable.value,
        expiresAt: verificationTable.expiresAt,
      });

    return record;
  },
};

const nonceIssueStore = {
  replace: async (identifier: string, value: string, expiresAt: Date) => {
    const now = new Date();
    await db
      .insert(verificationTable)
      .values({
        id: randomUUID(),
        identifier,
        value,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: verificationTable.identifier,
        set: { value, expiresAt, updatedAt: now },
      });
  },
};

export interface SIWSPluginOptions {
  domain: string;
  chainId: "SN_MAIN" | "SN_SEPOLIA";
  version?: string;
  resources?: string[];
}

function getRpcNodeUrl(chainId: "SN_MAIN" | "SN_SEPOLIA") {
  if (chainId === "SN_MAIN") {
    return "https://api.cartridge.gg/x/starknet/mainnet";
  }
  return "https://api.cartridge.gg/x/starknet/sepolia";
}

export const siws = (options: SIWSPluginOptions) =>
  ({
    id: "sign-in-with-starknet",
    schema: {
      user: {
        fields: {
          address: {
            type: "string",
            unique: true,
          },
        },
      },
    },
    endpoints: {
      // Generate nonce endpoint
      nonce: createAuthEndpoint(
        "/siws/nonce",
        {
          method: "POST",
          body: z.object({
            address: StarknetAddressSchema,
          }),
        },
        async (ctx) => {
          const nonce = await issueSiwsNonce({
            store: nonceIssueStore,
            address: ctx.body.address,
          });

          return { nonce };
        },
      ),
      // Verify siws payload
      verify: createAuthEndpoint(
        "/siws/verify",
        {
          method: "POST",
          body: z.object({
            message: z.string().min(1).max(10_000),
            signature: z
              .string()
              .regex(/^0x[0-9a-fA-F]+$/)
              .array()
              .min(2)
              .max(32),
            address: StarknetAddressSchema,
          }),
        },
        async (ctx) => {
          const { message, signature, address } = ctx.body;

          try {
            const siwsMessage = SiwsTypedData.fromJson(message);
            // Find stored nonce to check it's validity
            const verification =
              await ctx.context.internalAdapter.findVerificationValue(
                `siws_${address.toLowerCase()}`,
              );
            // Ensure nonce is valid and not expired
            if (!verification || new Date() > verification.expiresAt) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Invalid or expired nonce",
              });
            }

            if (verification.value !== siwsMessage.message.nonce) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Nonce mismatch",
              });
            }

            const signedAddress = StarknetAddressSchema.safeParse(
              siwsMessage.message.address,
            );
            if (!signedAddress.success || signedAddress.data !== address) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Address mismatch",
              });
            }

            const requestHost =
              ctx.request?.headers.get("host") ?? new URL(options.domain).host;
            if (
              !isTrustedSiwsOrigin({
                configuredOrigin: options.domain,
                requestHost,
                signedDomain: siwsMessage.domain.name,
                signedUri: siwsMessage.message.uri,
              })
            ) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Domain mismatch",
              });
            }

            if (siwsMessage.domain.chainId !== options.chainId) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Unsupported network",
              });
            }

            // The SIWS package in use targets an older starknet Contract API.
            // Verify against the account contract using starknet v9 directly.
            const provider = new RpcProvider({
              nodeUrl: getRpcNodeUrl(siwsMessage.domain.chainId),
            });

            const isValid = await verifyMessageInStarknet(
              provider,
              siwsMessage as unknown as Parameters<
                typeof verifyMessageInStarknet
              >[1],
              signature,
              address,
            );

            if (!isValid) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Invalid SIWS signature",
              });
            }

            await consumeSiwsNonce({
              store: nonceStore,
              address,
              signedNonce: siwsMessage.message.nonce,
            });

            let user = await ctx.context.internalAdapter.findUserById(address);

            if (!user) {
              user = await ctx.context.internalAdapter.createUser({
                name: address,
                email: `${address.toLowerCase()}@wallet.realms.world`,
                id: ctx.body.address,
                address,
              });
            }

            const session = await ctx.context.internalAdapter.createSession(
              user.id,
            );

            if (!session.id) {
              return ctx.json(null, {
                status: 500,
                body: {
                  message: "Internal Server Error",
                  status: "500",
                },
              });
            }

            await setSessionCookie(ctx, { session, user });

            return ctx.json({ token: session.token });
          } catch (error: unknown) {
            if (error instanceof APIError) throw error;
            throw new APIError("UNAUTHORIZED", toPublicSiwsError(error));
          }
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
