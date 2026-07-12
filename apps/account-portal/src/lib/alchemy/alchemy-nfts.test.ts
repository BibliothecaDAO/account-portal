import { describe, expect, it } from "vitest";

import {
  collectAlchemyNfts,
  createAlchemyNftsUrl,
  mapAlchemyNfts,
} from "./alchemy-nfts";

describe("createAlchemyNftsUrl", () => {
  it("constructs an encoded owner request for the active network", () => {
    const url = createAlchemyNftsUrl({
      network: "sepolia",
      apiKey: "api/key",
      owner: "0x0000000000000000000000000000000000000abc",
      contractAddress: "0x0000000000000000000000000000000000000def",
      withMetadata: false,
      pageSize: 1,
    });

    expect(url.origin).toBe("https://eth-sepolia.g.alchemy.com");
    expect(url.pathname).toBe("/nft/v3/api%2Fkey/getNFTsForOwner");
    expect(url.searchParams.get("owner")).toBe(
      "0x0000000000000000000000000000000000000abc",
    );
    expect(url.searchParams.getAll("contractAddresses[]")).toEqual([
      "0x0000000000000000000000000000000000000def",
    ]);
    expect(url.searchParams.get("withMetadata")).toBe("false");
  });
});

describe("collectAlchemyNfts", () => {
  it("collects every page in order", async () => {
    const pages = new Map([
      [
        undefined,
        {
          ownedNfts: [{ tokenId: "1", contract: { address: "0xdef" } }],
          totalCount: 2,
          pageKey: "next",
        },
      ],
      [
        "next",
        {
          ownedNfts: [{ tokenId: "2", contract: { address: "0xdef" } }],
          totalCount: 2,
        },
      ],
    ]);
    const fetchPage = (pageKey?: string) => {
      const page = pages.get(pageKey);
      if (!page) throw new Error("unexpected page");
      return Promise.resolve(page);
    };

    await expect(collectAlchemyNfts(fetchPage)).resolves.toMatchObject({
      ownedNfts: [{ tokenId: "1" }, { tokenId: "2" }],
      totalCount: 2,
    });
  });

  it("rejects a repeated cursor instead of looping forever", async () => {
    await expect(
      collectAlchemyNfts(() =>
        Promise.resolve({
          ownedNfts: [],
          totalCount: 1,
          pageKey: "same-cursor",
        }),
      ),
    ).rejects.toThrow("repeated pagination cursor");
  });
});

describe("mapAlchemyNfts", () => {
  it("maps missing optional metadata to stable nulls", () => {
    expect(
      mapAlchemyNfts({
        ownedNfts: [
          {
            tokenId: "42",
            contract: { address: "0xdef" },
          },
        ],
        totalCount: 1,
      }),
    ).toEqual({
      tokens: [
        {
          token: {
            tokenId: "42",
            name: null,
            image: null,
            collection: {
              id: "0xdef",
              name: undefined,
              symbol: undefined,
            },
            attributes: [],
          },
          ownership: { tokenCount: "1", acquiredAt: null },
        },
      ],
      continuation: null,
    });
  });
});
