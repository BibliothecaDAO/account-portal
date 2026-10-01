import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { parseOptions, runScan } from "./hypersync-smoke.mjs";

test("smoke limits reject ambiguous, unbounded and unsupported input", () => {
  for (const args of [
    ["--network", "other"],
    ["--max-calls", "21"],
    ["--max-events", "1001"],
    ["--timeout-seconds", "121"],
    ["--from", "10"],
    ["--from", "20", "--to", "10"],
    ["--from", "1", "--to", "1000001"],
    ["--recent", "1", "--from", "10", "--to", "20"],
    ["--rpc", "anything"],
    ["--max-calls", "1"],
    ["--network", "mainnet", "--network", "sepolia"],
  ])
    assert.throws(() => parseOptions(args));
});

test("call cap includes recent height request and empty ranges advance", async () => {
  const options = parseOptions([
    "--recent",
    "30",
    "--max-calls",
    "2",
    "--chunk-blocks",
    "10",
  ]);
  let requests = 0;
  const report = await runScan(options, {
    route: { l1StartBlock: 1 },
    height: async () => {
      requests++;
      return 100;
    },
    query: async (from, to) => {
      requests++;
      assert.equal(from, 71);
      return { nextBlock: to + 1, events: [] };
    },
  });
  assert.equal(requests, 2);
  assert.equal(report.complete, false);
  assert.equal(report.nextBlock, 81);
  assert.equal(report.stopReason, "call-limit");
});

test("event cap and invalid pagination stop bounded scans", async () => {
  const options = parseOptions([
    "--from",
    "10",
    "--to",
    "30",
    "--max-events",
    "1",
  ]);
  const source = {
    route: { l1StartBlock: 1 },
    query: async () => ({
      nextBlock: 31,
      events: [{ eventName: "LogMessageToL2" }],
      truncated: true,
    }),
  };
  const report = await runScan(options, source);
  assert.equal(report.eventCount, 1);
  assert.equal(report.complete, false);
  assert.equal(report.stopReason, "event-limit");
  await assert.rejects(
    runScan(options, {
      ...source,
      query: async () => ({ nextBlock: 10, events: [] }),
    }),
    /pagination/,
  );
});

for (const network of ["mainnet", "sepolia"]) {
  test(`native ${network} client resolves exact production topic filters offline`, () => {
    // New process avoids Envio's global config/registration caches between networks.
    // Constructing the native client makes no request; never call height/query here.
    const code = `import {prepareNative,parseOptions,verifyTopicFilters} from './scripts/hypersync-smoke.mjs';
      const source=await prepareNative(parseOptions(['--network','${network}']), 'offline-unused-placeholder');
      verifyTopicFilters(source.nativeRegistrations,source.route);
      source.nativeRegistrations[0].topicSelections[0].topic1=[];
      let rejected=false;try{verifyTopicFilters(source.nativeRegistrations,source.route)}catch{rejected=true}
      if(!rejected)throw Error('Broad filter accepted');`;
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", code],
      {
        cwd: new URL("..", import.meta.url),
        encoding: "utf8",
        timeout: 15000,
        env: { PATH: process.env.PATH },
      },
    );
    assert.equal(result.status, 0, result.stderr);
  });
}

test("CLI missing token fails without printing supplied argument secrets", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/hypersync-smoke.mjs", "--unknown", "secret-placeholder"],
    {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
      env: { PATH: process.env.PATH },
    },
  );
  assert.equal(result.status, 1);
  assert.ok(!result.stderr.includes("secret-placeholder"));
  assert.ok(!result.stdout.includes("secret-placeholder"));
});
