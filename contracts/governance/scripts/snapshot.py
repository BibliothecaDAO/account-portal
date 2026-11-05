#!/usr/bin/env python3
"""Offline snapshot preparation and tally reproduction; never signs or sends transactions."""

import argparse
import hashlib
import json
from math import isqrt
from pathlib import Path

FIELD = 2**251 + 17 * 2**192 + 1
ADDRESS_BOUND = 2**251 - 256
SCALE = 10**18
BPS = 10_000
COMPONENTS = ("realms", "velords", "xp")
COEFFICIENTS = ("realm_bps", "velords_bps", "xp_bps")
CHOICES = {"None", "Against", "For", "Abstain"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def integer(value, maximum, name, minimum=0):
    require(type(value) in (int, str), f"{name}: expected an integer or integer string")
    number = int(value, 16 if value.startswith("0x") else 10) if isinstance(value, str) else value
    require(minimum <= number <= maximum, f"{name}: out of range")
    return number


def felt(value, name):
    return integer(value, FIELD - 1, name, 1)


def address(value, name):
    return integer(value, ADDRESS_BOUND - 1, name, 1)


def normalize_policy(raw):
    limits = {
        "version": FIELD - 1,
        **{key: 2**16 - 1 for key in (*COEFFICIENTS, "quorum_bps", "minimum_yes_bps", "approval_bps")},
        "minimum_supporters": 2**32 - 1,
        **{key: 2**64 - 1 for key in ("voting_delay", "voting_period", "execution_delay", "execution_window")},
        "maximum_payment": 2**128 - 1,
        "total_budget": 2**128 - 1,
    }
    require(set(raw) == set(limits), "policy fields must exactly match Policy in types.cairo")
    p = {key: integer(raw[key], maximum, key) for key, maximum in limits.items()}
    require(p["version"] > 0, "zero policy version")
    require(sum(p[key] for key in COEFFICIENTS) == BPS, "blend must sum to 10000")
    for key in ("quorum_bps", "minimum_yes_bps"):
        require(0 < p[key] <= BPS, f"invalid {key}")
    require(5000 <= p["approval_bps"] < BPS, "invalid approval threshold")
    for key in ("minimum_supporters", "voting_delay", "voting_period", "execution_delay", "execution_window", "maximum_payment"):
        require(p[key] > 0, f"{key} must be positive")
    require(p["total_budget"] >= p["maximum_payment"], "budget below payment limit")
    return p


def prepare(raw, batch_size=10):
    require(1 <= batch_size <= 100, "batch size must be 1..100")
    policy = normalize_policy(raw["policy"])
    require(bool(raw["network"]), "network is required")
    require(bool(raw["source_blocks"]), "source block evidence is required")
    require(bool(raw["identity_evidence"]), "identity evidence reference is required")
    for block in raw["source_blocks"]:
        require(bool(block["chain"]), "source chain required")
        integer(block["number"], 2**64 - 1, "block number")
        require(bool(block["hash"]), "source block hash required")
    recipient = address(raw["recipient"], "recipient")
    amount = integer(raw["amount"], policy["maximum_payment"], "amount", 1)
    members, ids, controllers = [], set(), set()
    for item in raw["members"]:
        participant = felt(item["participant"], "participant")
        controller = address(item["controller"], "controller")
        require(participant not in ids, "duplicate participant")
        require(controller not in controllers, "duplicate controller")
        ids.add(participant)
        controllers.add(controller)
        values = {key: integer(item[key], 2**128 - 1, key) for key in COMPONENTS}
        require(any(values[key] and policy[bps] for key, bps in zip(COMPONENTS, COEFFICIENTS)), "no eligible assets")
        members.append({"participant": hex(participant), "controller": hex(controller), **{key: str(value) for key, value in values.items()}})
    require(0 < len(members) <= 2**32 - 1, "invalid electorate size")
    members.sort(key=lambda item: int(item["participant"], 16))
    roots = {item["participant"]: {key: isqrt(int(item[key]) * SCALE) for key in COMPONENTS} for item in members}
    totals = {key: sum(row[key] for row in roots.values()) for key in COMPONENTS}
    for key, bps in zip(COMPONENTS, COEFFICIENTS):
        require(not policy[bps] or totals[key] > 0, f"empty enabled component: {key}")
    weights = {
        participant: sum(row[key] * (SCALE // BPS) * policy[bps] // totals[key] for key, bps in zip(COMPONENTS, COEFFICIENTS) if policy[bps])
        for participant, row in roots.items()
    }
    manifest = {
        "schema": "realms-governance-snapshot-v1", "network": raw["network"],
        "source_blocks": raw["source_blocks"], "identity_evidence": raw["identity_evidence"],
        "policy": {key: str(value) for key, value in policy.items()},
        "recipient": hex(recipient), "amount": str(amount), "members": members,
    }
    canonical = json.dumps(manifest, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode()
    digest = hashlib.sha256(canonical).hexdigest()
    commitment = int(digest, 16) % FIELD
    require(commitment != 0, "zero manifest commitment")
    batches = []
    for offset in range(0, len(members), batch_size):
        batch = members[offset:offset + batch_size]
        # prepend proposal_id after create_proposal succeeds.
        calldata = [str(len(batch))]
        for item in batch:
            calldata.extend([item["participant"], item["controller"], *(item[key] for key in COMPONENTS)])
        batches.append(calldata)
    return {
        "manifest": manifest, "sha256": digest, "manifest_hash": hex(commitment),
        "weights": {key: str(value) for key, value in weights.items()},
        "total_power": str(sum(weights.values())),
        "create_proposal_calldata": [hex(commitment), hex(recipient), str(amount)],
        "enroll_calldata_without_proposal_id": batches,
    }


def tally(prepared, ballots):
    """Reproduce an exported final ballot state, assuming complete authentic chain evidence."""
    weights = {key: int(value) for key, value in prepared["weights"].items()}
    direct, mandates, delegates = {}, {}, {}
    for key, choice in ballots.get("direct", {}).items():
        participant = hex(felt(key, "direct participant"))
        require(participant in weights and participant not in direct, "unknown or duplicate direct participant")
        require(choice in CHOICES, "invalid direct choice")
        direct[participant] = choice
    for key, choice in ballots.get("delegates", {}).items():
        delegate = hex(address(key, "delegate"))
        require(delegate not in delegates and choice in CHOICES, "invalid or duplicate delegate ballot")
        delegates[delegate] = choice
    cutoff = integer(ballots["cutoff_time"], 2**64 - 1, "cutoff_time")
    close = integer(ballots["ends_at"], 2**64 - 1, "ends_at")
    revision = integer(ballots["delegation_revision"], 2**64 - 1, "delegation_revision")
    p = {key: int(value) for key, value in prepared["manifest"]["policy"].items()}
    require(close == cutoff + p["voting_delay"] + p["voting_period"], "ballot interval differs from policy")
    for key, value in ballots.get("mandates", {}).items():
        participant = hex(felt(key, "mandate participant"))
        require(participant in weights and participant not in mandates, "unknown or duplicate mandate participant")
        integer(value["revision"], revision, "mandate revision", 1)
        start = integer(value["starts_at"], 2**64 - 1, "starts_at")
        end = integer(value["expires_at"], 2**64 - 1, "expires_at")
        require(end >= start and end - start <= 90 * 86400, "invalid mandate duration")
        delegate = hex(address(value["delegate"], "delegate"))
        mandates[participant] = delegate if start <= cutoff and end >= close else None
    result = {"for_votes": 0, "against_votes": 0, "abstain_votes": 0, "supporters": 0}
    keys = {"For": "for_votes", "Against": "against_votes", "Abstain": "abstain_votes"}
    for participant, weight in weights.items():
        choice = direct.get(participant, delegates.get(mandates.get(participant), "None"))
        if choice in keys:
            result[keys[choice]] += weight
        if choice == "For" and weight > 0:
            result["supporters"] += 1
    supply = int(prepared["total_power"])
    yes, no, abstain = (result[key] for key in ("for_votes", "against_votes", "abstain_votes"))
    result["passed"] = bool(supply and yes + no and
        (yes + no + abstain) * BPS >= supply * p["quorum_bps"] and
        yes * BPS >= supply * p["minimum_yes_bps"] and
        yes * BPS > (yes + no) * p["approval_bps"] and
        result["supporters"] >= p["minimum_supporters"])
    return {key: str(value) if key.endswith("_votes") else value for key, value in result.items()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--batch-size", type=int, default=10)
    parser.add_argument("--ballots", type=Path, help="Final ballot-state export for independent tally reproduction")
    parser.add_argument("--verify", type=Path, help="Compare weights, total_power, manifest_hash, and optional tally against a chain export")
    args = parser.parse_args()
    try:
        result = prepare(json.loads(args.input.read_text()), args.batch_size)
        if args.ballots:
            result["tally"] = tally(result, json.loads(args.ballots.read_text()))
        if args.verify:
            exported = json.loads(args.verify.read_text())
            for key in ("manifest_hash", "weights", "total_power", *(("tally",) if args.ballots else ())):
                require(exported[key] == result[key], f"verification mismatch: {key}")
            result["verified_export"] = str(args.verify)
        output = json.dumps(result, indent=2) + "\n"
        if args.output:
            args.output.write_text(output)
        else:
            print(output, end="")
    except (ValueError, KeyError, TypeError, OSError) as error:
        parser.exit(1, f"snapshot error: {error}\n")


if __name__ == "__main__":
    main()
