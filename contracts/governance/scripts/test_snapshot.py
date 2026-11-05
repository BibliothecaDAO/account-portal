import copy
import json
from pathlib import Path
import unittest

from snapshot import SCALE, prepare, tally

EXAMPLES = Path(__file__).resolve().parents[1] / "examples"


class SnapshotTests(unittest.TestCase):
    def setUp(self):
        self.raw = json.loads((EXAMPLES / "snapshot.json").read_text())
        self.ballots = json.loads((EXAMPLES / "ballots.json").read_text())

    def test_matches_cairo_blend_and_encodes_span(self):
        result = prepare(self.raw, batch_size=1)
        self.assertEqual(result["weights"], {"0xa": "600000000000000000", "0x14": "400000000000000000"})
        self.assertEqual(result["total_power"], str(SCALE))
        self.assertEqual(result["enroll_calldata_without_proposal_id"][0], ["1", "0xa", "0xa", "100", "0", "0"])
        self.assertEqual(result["create_proposal_calldata"][1:], ["0x3e7", "100"])

    def test_manifest_is_canonical_and_commits_to_amount(self):
        original = prepare(self.raw)
        self.raw["members"].reverse()
        self.assertEqual(prepare(self.raw)["manifest_hash"], original["manifest_hash"])
        self.raw["amount"] = "99"
        self.assertNotEqual(prepare(self.raw)["manifest_hash"], original["manifest_hash"])

    def test_duplicate_controller_alias_is_rejected(self):
        self.raw["members"][1]["controller"] = "0x000A"
        with self.assertRaisesRegex(ValueError, "duplicate controller"):
            prepare(self.raw)

    def test_duplicate_participant_alias_is_rejected(self):
        self.raw["members"][1]["participant"] = "10"
        with self.assertRaisesRegex(ValueError, "duplicate participant"):
            prepare(self.raw)

    def test_float_and_oversized_amounts_are_rejected(self):
        for invalid in (True, 1.5, str(2**128)):
            self.raw["members"][0]["realms"] = invalid
            with self.assertRaises(ValueError):
                prepare(self.raw)

    def test_missing_xp_is_not_redistributed(self):
        self.raw["policy"]["realm_bps"] = 5000
        self.raw["policy"]["xp_bps"] = 1000
        with self.assertRaisesRegex(ValueError, "empty enabled component: xp"):
            prepare(self.raw)

    def test_direct_override_and_withdrawal(self):
        snapshot = prepare(self.raw)
        result = tally(snapshot, self.ballots)
        self.assertEqual(result["against_votes"], "600000000000000000")
        self.assertEqual(result["for_votes"], "400000000000000000")
        self.assertFalse(result["passed"])
        self.ballots["direct"]["0xa"] = "None"
        result = tally(snapshot, self.ballots)
        self.assertEqual(result["against_votes"], "0")
        self.assertEqual(result["abstain_votes"], "0")
        self.assertEqual(result["supporters"], 1)
        self.assertFalse(result["passed"])

    def test_two_represented_participants_pass_breadth(self):
        self.ballots["direct"] = {}
        result = tally(prepare(self.raw), self.ballots)
        self.assertEqual(result["for_votes"], str(SCALE))
        self.assertEqual(result["supporters"], 2)
        self.assertTrue(result["passed"])

    def test_mandate_must_cover_whole_ballot(self):
        self.ballots["direct"] = {}
        self.ballots["mandates"]["0xa"]["expires_at"] = self.ballots["ends_at"] - 1
        result = tally(prepare(self.raw), self.ballots)
        self.assertEqual(result["for_votes"], "400000000000000000")
        self.ballots["mandates"]["0xa"]["expires_at"] += 1
        self.assertTrue(tally(prepare(self.raw), self.ballots)["passed"])

    def test_future_mandates_and_wrong_close_are_rejected(self):
        original = copy.deepcopy(self.ballots)
        self.ballots["mandates"]["0xa"]["revision"] = 3
        with self.assertRaises(ValueError):
            tally(prepare(self.raw), self.ballots)
        original["ends_at"] += 1
        with self.assertRaisesRegex(ValueError, "ballot interval differs"):
            tally(prepare(self.raw), original)


if __name__ == "__main__":
    unittest.main()
