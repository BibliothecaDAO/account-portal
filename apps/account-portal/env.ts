import { parsePublicEnvironment } from "./src/config/environment";

const isCiBuild = import.meta.env.CI === true || import.meta.env.CI === "true";

export const env = parsePublicEnvironment(
  {
    VITE_PUBLIC_CHAIN: import.meta.env.VITE_PUBLIC_CHAIN,
    VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
    VITE_PUBLIC_IMAGE_CDN_URL: import.meta.env.VITE_PUBLIC_IMAGE_CDN_URL,
    VITE_PUBLIC_IMAGE_PROXY_URL: import.meta.env.VITE_PUBLIC_IMAGE_PROXY_URL,
    VITE_PUBLIC_IPFS_GATEWAY: import.meta.env.VITE_PUBLIC_IPFS_GATEWAY,
    VITE_TORII_API_URL: import.meta.env.VITE_TORII_API_URL,
    VITE_PUBLIC_SLOT: import.meta.env.VITE_PUBLIC_SLOT,
    VITE_PUBLIC_NODE_URL: import.meta.env.VITE_PUBLIC_NODE_URL,
  },
  { isCi: isCiBuild },
);

export type Env = typeof env;
