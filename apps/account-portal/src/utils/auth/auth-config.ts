interface AuthRuntimeEnvironment {
  nodeEnv?: string;
  baseUrl?: string;
  secret?: string;
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export interface AuthRuntimeConfig {
  baseURL: string;
  secret: string | undefined;
  trustedOrigins: string[];
}

export function resolveAuthRuntimeConfig({
  nodeEnv,
  baseUrl,
  secret,
}: AuthRuntimeEnvironment): AuthRuntimeConfig {
  const isProduction = nodeEnv === "production";

  if (isProduction && !baseUrl) {
    throw new Error("VITE_BASE_URL is required in production");
  }

  const parsedBaseUrl = new URL(baseUrl ?? "http://localhost:3000");

  if (
    isProduction &&
    parsedBaseUrl.protocol !== "https:" &&
    !LOOPBACK_HOSTS.has(parsedBaseUrl.hostname)
  ) {
    throw new Error("VITE_BASE_URL must use HTTPS in production");
  }

  const baseURL = parsedBaseUrl.origin;

  if (isProduction && (!secret || secret.length < 32)) {
    throw new Error(
      "BETTER_AUTH_SECRET must contain at least 32 characters in production",
    );
  }

  return {
    baseURL,
    secret,
    trustedOrigins: [baseURL],
  };
}
