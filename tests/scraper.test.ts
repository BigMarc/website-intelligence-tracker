import { describe, expect, it } from "vitest";
import { shouldSkipDuplicateSnapshot } from "@/lib/scraper";

describe("duplicate snapshot prevention", () => {
  it("skips same-day duplicate snapshots unless forced", () => {
    expect(shouldSkipDuplicateSnapshot({ existingSnapshotId: "snapshot_1" })).toBe(true);
    expect(shouldSkipDuplicateSnapshot({ existingSnapshotId: "snapshot_1", force: true })).toBe(false);
    expect(shouldSkipDuplicateSnapshot({ existingSnapshotId: null })).toBe(false);
  });
});
