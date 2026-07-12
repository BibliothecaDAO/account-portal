import { randomBytes } from "node:crypto";

export type EntropySource = () => Uint8Array;

export interface SiwsNonceRecord {
  id: string;
  value: string;
  expiresAt: Date;
}

export interface SiwsNonceStore {
  take: (
    identifier: string,
    expectedValue: string,
  ) => Promise<SiwsNonceRecord | undefined>;
}

export interface SiwsNonceIssueStore {
  replace: (
    identifier: string,
    value: string,
    expiresAt: Date,
  ) => Promise<void>;
}

interface SiwsOriginInput {
  configuredOrigin: string;
  requestHost: string;
  signedDomain: string;
  signedUri: string;
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function parseHost(value: string): { hostname: string; port: string } | null {
  try {
    const url = new URL(value.includes("://") ? value : `http://${value}`);
    return { hostname: url.hostname, port: url.port };
  } catch {
    return null;
  }
}

function isEquivalentHost(left: string, right: string): boolean {
  const a = parseHost(left);
  const b = parseHost(right);
  if (!a) return false;
  if (!b) return false;
  if (a.port !== b.port) return false;
  if (a.hostname === b.hostname) return true;
  return LOOPBACK_HOSTS.has(a.hostname) && LOOPBACK_HOSTS.has(b.hostname);
}

export function isTrustedSiwsOrigin({
  configuredOrigin,
  requestHost,
  signedDomain,
  signedUri,
}: SiwsOriginInput): boolean {
  try {
    const configuredUrl = new URL(configuredOrigin);
    const signedUrl = new URL(signedUri);

    return (
      signedUrl.protocol === configuredUrl.protocol &&
      isEquivalentHost(signedDomain, configuredUrl.host) &&
      isEquivalentHost(signedDomain, requestHost) &&
      isEquivalentHost(signedUrl.host, configuredUrl.host)
    );
  } catch {
    return false;
  }
}

export function createSiwsNonce(
  entropySource: EntropySource = () => randomBytes(32),
): string {
  const entropy = entropySource();
  if (entropy.length !== 32) {
    throw new Error("SIWS nonce entropy must contain exactly 32 bytes");
  }

  return Array.from(entropy, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function issueSiwsNonce({
  store,
  address,
  entropySource,
  now = new Date(),
}: {
  store: SiwsNonceIssueStore;
  address: string;
  entropySource?: EntropySource;
  now?: Date;
}): Promise<string> {
  const nonce = createSiwsNonce(entropySource);
  await store.replace(
    `siws_${address.toLowerCase()}`,
    nonce,
    new Date(now.getTime() + 15 * 60 * 1000),
  );
  return nonce;
}

export async function consumeSiwsNonce({
  store,
  address,
  signedNonce,
  now = new Date(),
}: {
  store: SiwsNonceStore;
  address: string;
  signedNonce: string;
  now?: Date;
}): Promise<void> {
  const verification = await store.take(
    `siws_${address.toLowerCase()}`,
    signedNonce,
  );

  if (!verification || now > verification.expiresAt) {
    throw new Error("Invalid or expired SIWS nonce");
  }
}
