import { describe, expect, it } from "vitest";

import { transformMarkdownUrl } from "./markdown-url";

describe("transformMarkdownUrl", () => {
  it("routes IPFS content through the configured gateway", () => {
    expect(
      transformMarkdownUrl(
        "ipfs://bafy/image.png",
        "https://gateway.example/ipfs/",
      ),
    ).toBe("https://gateway.example/ipfs/bafy/image.png");
  });

  it("adds one gateway separator when needed", () => {
    expect(
      transformMarkdownUrl(
        "ipfs://bafy/image.png",
        "https://gateway.example/ipfs",
      ),
    ).toBe("https://gateway.example/ipfs/bafy/image.png");
  });

  it("rejects script URLs while preserving HTTPS links", () => {
    expect(transformMarkdownUrl("javascript:alert(1)")).toBe("");
    expect(transformMarkdownUrl("https://realms.world/docs")).toBe(
      "https://realms.world/docs",
    );
  });
});
