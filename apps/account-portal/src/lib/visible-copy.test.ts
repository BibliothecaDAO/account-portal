import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Generated code and API names keep the spelling their schemas use.
const notCopy = /^(abi|gql)\/|\.gen\.ts$|\.test\.tsx?$|^types\/ark\.ts$|^lib\/snapshot\/getProposals\.ts$/;

const british =
  /\b(?:colour|favour|behaviour|honour|neighbour|flavour|centre|licence|defence|grey|whilst|cancelled|cancelling|labelled|travelling|modelling|organis|recognis|authoris|customis|summaris|initialis|normalis|analyse|spelt|learnt|judgement)/gi;
const lowercaseRealm = /\b(?:the|your|a|an|this|that|each|every|one|no|all|top|\d+) realms?\b/g;

function listCopySources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listCopySources(path);
    return /\.(?:ts|tsx|mdx)$/.test(path) && !notCopy.test(relative(srcDir, path)) ? [path] : [];
  });
}

function findInCopy(pattern: RegExp): string[] {
  return listCopySources(srcDir).flatMap((file) => {
    const copy = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|(?<![:"'`])\/\/.*$/gm, "");
    return (copy.match(pattern) ?? []).map((hit) => `${relative(srcDir, file)}: ${hit}`);
  });
}

describe("visible copy", () => {
  it("uses American spelling", () => {
    expect(findInCopy(british)).toEqual([]);
  });

  it("capitalizes Realm", () => {
    expect(findInCopy(lowercaseRealm)).toEqual([]);
  });
});
