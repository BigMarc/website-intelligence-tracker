import { describe, expect, it } from "vitest";
import { delayForRequest, shouldSkipDuplicateSnapshot } from "@/lib/scraper";

describe("duplicate snapshot prevention", () => {
  it("skips same-day duplicate snapshots unless forced", () => {
    expect(shouldSkipDuplicateSnapshot({ existingSnapshotId: "snapshot_1" })).toBe(true);
    expect(shouldSkipDuplicateSnapshot({ existingSnapshotId: "snapshot_1", force: true })).toBe(false);
    expect(shouldSkipDuplicateSnapshot({ existingSnapshotId: null })).toBe(false);
  });
});

describe("scrape pacing", () => {
  it("honors a provider-specific minimum delay", () => {
    expect(delayForRequest(0, 45000)).toBe(0);
    expect(delayForRequest(1, 45000)).toBeGreaterThanOrEqual(45000);
  });
});
