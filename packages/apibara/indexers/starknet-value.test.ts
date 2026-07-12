import { describe, expect, it } from "vitest";

import { toEthereumAddress, toStarknetAddress } from "./starknet-value";

describe("toStarknetAddress", () => {
  it("stores Starknet addresses as normalized lowercase hex", () => {
    expect(toStarknetAddress(2748n)).toBe("0xabc");
    expect(toStarknetAddress("0x000ABC")).toBe("0xabc");
  });

  it.each([0n, -1n, 2n ** 251n])("rejects invalid address %s", (address) => {
    expect(() => toStarknetAddress(address)).toThrow(
      "Invalid Starknet address",
    );
  });
});

describe("toEthereumAddress", () => {
  it("pads Ethereum addresses to exactly 20 bytes", () => {
    expect(toEthereumAddress(2748n)).toBe(
      "0x0000000000000000000000000000000000000abc",
    );
  });

  it("rejects values outside the Ethereum address range", () => {
    expect(() => toEthereumAddress(2n ** 160n)).toThrow(
      "Invalid Ethereum address",
    );
  });
});
