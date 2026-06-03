import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@/lib/env";
import { SimilarwebApiProvider } from "@/providers/similarweb-api";

const originalApiEnabled = env.similarwebApiEnabled;
const originalApiKey = env.similarwebApiKey;

describe("Similarweb official API provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    env.similarwebApiEnabled = originalApiEnabled;
    env.similarwebApiKey = originalApiKey;
  });

  it("normalizes traffic and source metrics from V5 responses", async () => {
    env.similarwebApiEnabled = true;
    env.similarwebApiKey = "test-key";

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              data: [
                {
                  date: "2026-04",
                  visits: 1200000,
                  bounce_rate: 0.5422,
                  pages_per_visit: 3.4,
                  average_visit_duration: 221
                }
              ]
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              data: [
                { date: "2026-04", source_type: "Direct", visits: 600000 },
                { date: "2026-04", source_type: "Organic Search", visits: 300000 },
                { date: "2026-04", source_type: "Social", visits: 100000 }
              ]
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
    );

    const result = await new SimilarwebApiProvider().collectDomainSnapshot({
      domain: "example.com",
      collectedAt: new Date("2026-06-03T08:00:00.000Z")
    });

    expect(result.status).toBe("success");
    expect(result.metrics.estimatedMonthlyVisits).toBe(1200000);
    expect(result.metrics.bounceRate).toBe(54.22);
    expect(result.metrics.pagesPerVisit).toBe(3.4);
    expect(result.metrics.averageVisitDurationSeconds).toBe(221);
    expect(result.trafficChannels).toContainEqual({ channel: "direct", sharePercent: 60 });
    expect(result.trafficChannels).toContainEqual({ channel: "organic_search", sharePercent: 30 });
    expect(result.trafficChannels).toContainEqual({ channel: "social", sharePercent: 10 });
  });
});
