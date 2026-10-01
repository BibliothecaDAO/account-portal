import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import { getBridgeNetworkConfig } from "@realms-world/bridge";

interface Config {
  rollback_on_reorg: boolean;
  raw_events: boolean;
  address_format: string;
  field_selection: { block_fields: string[]; transaction_fields: string[] };
  contracts: { name: string; events: { event: string }[] }[];
  chains: {
    id: number;
    start_block: number;
    max_reorg_depth: number;
    block_lag: number;
    hypersync_config: { url: string };
    contracts: { name: string; address: string }[];
  }[];
}

describe("isolated network configurations", () => {
  for (const network of ["mainnet", "sepolia"] as const) {
    it(`preserves ${network} addresses, start height and source limits`, () => {
      const config = parse(
        readFileSync(
          new URL(`../config.${network}.yaml`, import.meta.url),
          "utf8",
        ),
      ) as Config;
      const expected = getBridgeNetworkConfig(network);
      expect(config.chains).toHaveLength(1);
      expect(config.chains[0]).toEqual({
        id: expected.l1ChainId,
        start_block: expected.l1StartBlock,
        max_reorg_depth: 200,
        block_lag: 0,
        hypersync_config: {
          url: `https://${expected.l1ChainId}.hypersync.xyz`,
        },
        contracts: [
          {
            name: "StarknetMessaging",
            address: expected.messagingAddress.toLowerCase(),
          },
        ],
      });
      expect(config.contracts).toHaveLength(1);
      expect(
        config.contracts[0]?.events.map((e) => e.event.split("(")[0]),
      ).toEqual([
        "LogMessageToL2",
        "ConsumedMessageToL2",
        "LogMessageToL1",
        "ConsumedMessageToL1",
      ]);
      expect(config.rollback_on_reorg).toBe(true);
      expect(config.raw_events).toBe(false);
      expect(config.address_format).toBe("lowercase");
      expect(config.field_selection).toEqual({
        block_fields: [],
        transaction_fields: ["hash"],
      });
    });
  }
});
