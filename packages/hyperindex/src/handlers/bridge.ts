import type { BridgeEventType, BridgeNetwork } from "@realms-world/bridge";
import type { EvmOnEvent, EvmOnEventContext } from "envio";
import { indexer } from "envio";

import {
  createBridgeEventId,
  decodeBridgePayload,
  getBridgeNetworkConfig,
} from "@realms-world/bridge";

export function networkForChain(chainId: number): BridgeNetwork {
  if (chainId === 1) return "mainnet";
  if (chainId === 11155111) return "sepolia";
  throw new Error(`Unsupported L1 bridge chain ${chainId}`);
}

export const eventTypes = {
  LogMessageToL2: "deposit_initiated_l1",
  ConsumedMessageToL2: "withdraw_completed_l2",
  LogMessageToL1: "withdraw_available_l1",
  ConsumedMessageToL1: "withdraw_completed_l1",
} as const satisfies Record<string, BridgeEventType>;

async function storeEvent({
  event,
  context,
}: {
  event: EvmOnEvent;
  context: EvmOnEventContext;
}) {
  const network = networkForChain(event.chainId);
  const route = getBridgeNetworkConfig(network);
  // The same route is filtered at the source by where; retain this guard because
  // Envio's synthetic source does not evaluate static indexed parameter filters.
  if (
    event.eventName === "LogMessageToL2" ||
    event.eventName === "ConsumedMessageToL2"
  ) {
    if (
      event.params.fromAddress.toLowerCase() !==
      route.l1BridgeAddress.toLowerCase()
    )
      return;
    if (
      event.eventName === "ConsumedMessageToL2" &&
      event.params.toAddress !== BigInt(route.l2BridgeAddress)
    )
      return;
  } else if (
    event.params.fromAddress !== BigInt(route.l2BridgeAddress) ||
    event.params.toAddress.toLowerCase() !== route.l1BridgeAddress.toLowerCase()
  ) {
    return;
  }
  const direction = event.eventName.endsWith("ToL1") ? "withdrawal" : "deposit";
  try {
    const decoded = decodeBridgePayload(
      network,
      direction,
      event.params.payload,
    );
    const previous = await context.L1BridgeEvent.getWhere({
      request_key: { _eq: decoded.requestKey },
    });
    for (const existing of previous) {
      if (
        existing.owner_l1 !== decoded.ownerL1 ||
        existing.owner_l2 !== decoded.ownerL2 ||
        JSON.stringify(existing.token_ids) !== JSON.stringify(decoded.tokenIds)
      ) {
        throw new Error(
          `Conflicting owners or tokens for request ${decoded.requestKey}`,
        );
      }
    }
    context.L1BridgeEvent.set({
      id: createBridgeEventId(
        String(event.chainId),
        event.block.hash,
        event.transaction.hash,
        event.logIndex,
      ),
      request_key: decoded.requestKey,
      network,
      direction,
      req_hash: decoded.reqHash,
      owner_l1: decoded.ownerL1,
      owner_l2: decoded.ownerL2,
      token_ids: decoded.tokenIds,
      payload: decoded.payload,
      source_chain: String(event.chainId),
      event_name: event.eventName,
      type: eventTypes[event.eventName],
      block_number: BigInt(event.block.number),
      block_hash: event.block.hash,
      transaction_hash: event.transaction.hash,
      log_index: event.logIndex,
      timestamp: new Date(event.block.timestamp * 1000),
    });
  } catch (cause) {
    throw new Error(
      `Invalid bridge event ${event.chainId}:${event.transaction.hash}:${event.logIndex} (${event.eventName})`,
      { cause },
    );
  }
}

indexer.onEvent(
  {
    contract: "StarknetMessaging",
    event: "LogMessageToL2",
    where: ({ chain }) => ({
      params: {
        fromAddress: getBridgeNetworkConfig(networkForChain(chain.id))
          .l1BridgeAddress,
      },
    }),
  },
  storeEvent,
);

indexer.onEvent(
  {
    contract: "StarknetMessaging",
    event: "ConsumedMessageToL2",
    where: ({ chain }) => {
      const config = getBridgeNetworkConfig(networkForChain(chain.id));
      return {
        params: {
          fromAddress: config.l1BridgeAddress,
          toAddress: BigInt(config.l2BridgeAddress),
        },
      };
    },
  },
  storeEvent,
);

for (const event of ["LogMessageToL1", "ConsumedMessageToL1"] as const) {
  indexer.onEvent(
    {
      contract: "StarknetMessaging",
      event,
      where: ({ chain }) => {
        const config = getBridgeNetworkConfig(networkForChain(chain.id));
        return {
          params: {
            fromAddress: BigInt(config.l2BridgeAddress),
            toAddress: config.l1BridgeAddress,
          },
        };
      },
    },
    storeEvent,
  );
}
