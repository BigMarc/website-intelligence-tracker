import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSimilarwebDataApiJson, parseSimilarwebHtml } from "@/providers/similarweb-public/parser";

describe("Similarweb public parser", () => {
  it("extracts public static metrics from a sanitized fixture", () => {
    const html = readFileSync("tests/fixtures/similarweb-public.html", "utf8");
    const result = parseSimilarwebHtml({
      html,
      domain: "example.com",
      sourceUrl: "https://www.similarweb.com/website/example.com/",
      collectedAt: new Date("2026-06-02T08:00:00.000Z")
    });

    expect(result.status).toBe("success");
    expect(result.metrics.estimatedMonthlyVisits).toBe(1200000);
    expect(result.metrics.globalRank).toBe(1245);
    expect(result.metrics.countryRank).toBe(234);
    expect(result.metrics.categoryRank).toBe(12);
    expect(result.metrics.bounceRate).toBe(54.22);
    expect(result.metrics.pagesPerVisit).toBe(3.4);
    expect(result.metrics.averageVisitDurationSeconds).toBe(221);
    expect(result.trafficChannels).toContainEqual({ channel: "direct", sharePercent: 44.2 });
    expect(result.topCountries).toContainEqual({ countryName: "United States", countryCode: "US", sharePercent: 42.2 });
  });

  it("does not invent values when data is missing", () => {
    const result = parseSimilarwebHtml({
      html: "<html><body><h1>No public data</h1></body></html>",
      domain: "example.com",
      sourceUrl: "https://www.similarweb.com/website/example.com/",
      collectedAt: new Date("2026-06-02T08:00:00.000Z")
    });
    expect(result.status).toBe("no_public_data");
    expect(result.metrics.estimatedMonthlyVisits).toBeNull();
  });

  it("extracts public metrics from the Similarweb data response", () => {
    const json = JSON.parse(readFileSync("tests/fixtures/similarweb-data-api.json", "utf8"));
    const result = parseSimilarwebDataApiJson({
      json,
      domain: "example.com",
      sourceUrl: "https://data.similarweb.com/api/v1/data?domain=example.com",
      collectedAt: new Date("2026-06-02T08:00:00.000Z")
    });

    expect(result.status).toBe("success");
    expect(result.metrics.estimatedMonthlyVisits).toBe(1200000);
    expect(result.metrics.globalRank).toBe(1245);
    expect(result.metrics.countryRank).toBe(234);
    expect(result.metrics.categoryRank).toBe(12);
    expect(result.metrics.bounceRate).toBe(54.22);
    expect(result.metrics.pagesPerVisit).toBe(3.4);
    expect(result.metrics.averageVisitDurationSeconds).toBe(221);
    expect(result.trafficChannels).toContainEqual({ channel: "direct", sharePercent: 44.2 });
    expect(result.trafficChannels).toContainEqual({ channel: "organic_search", sharePercent: 32.1 });
    expect(result.trafficChannels).toContainEqual({ channel: "social", sharePercent: 10 });
    expect(result.topCountries).toContainEqual({ countryName: "United States", countryCode: "US", sharePercent: 42.2 });
  });
});
