import { defaultUrlTransform } from "react-markdown";

const DEFAULT_IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export function transformMarkdownUrl(
  url: string,
  ipfsGateway = DEFAULT_IPFS_GATEWAY,
): string {
  const transformed = url.startsWith("ipfs://")
    ? `${ipfsGateway}${ipfsGateway.endsWith("/") ? "" : "/"}${url.slice(7)}`
    : url;

  return defaultUrlTransform(transformed);
}
