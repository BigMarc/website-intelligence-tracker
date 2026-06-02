import { describe, expect, it } from "vitest";
import {
  calculateTrafficChange,
  parseDurationToSeconds,
  parseMetricNumber,
  parsePercent,
  parseRank
} from "@/lib/metrics";

describe("metric parsing", () => {
  it("parses compact and comma-formatted numbers", () => {
    expect(parseMetricNumber("1,234")).toBe(1234);
    expect(parseMetricNumber("1.2K")).toBe(1200);
    expect(parseMetricNumber("18.7K")).toBe(18700);
    expect(parseMetricNumber("3.4M")).toBe(3400000);
    expect(parseMetricNumber("2.1B")).toBe(2100000000);
    expect(parseMetricNumber("3.4")).toBe(3.4);
  });

  it("parses percentages, durations, and ranks", () => {
    expect(parsePercent("54.22%")).toBe(54.22);
    expect(parseDurationToSeconds("00:03:41")).toBe(221);
    expect(parseRank("#1,245")).toBe(1245);
  });

  it("keeps missing data as null", () => {
    expect(parseMetricNumber("N/A")).toBeNull();
    expect(parsePercent("N/A")).toBeNull();
    expect(parseDurationToSeconds("N/A")).toBeNull();
    expect(parseRank("N/A")).toBeNull();
  });

  it("calculates traffic changes only when values are present and previous is positive", () => {
    expect(calculateTrafficChange({ latestValue: 120, previousValue: 100 })).toEqual({
      absoluteVisitChange: 20,
      percentageVisitChange: 20
    });
    expect(calculateTrafficChange({ latestValue: 120, previousValue: null }).percentageVisitChange).toBeNull();
    expect(calculateTrafficChange({ latestValue: 120, previousValue: 0 }).percentageVisitChange).toBeNull();
  });
});
