import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SimilarwebPublicProvider } from "@/providers/similarweb-public";

const robotsTxt = "User-agent: *\nAllow: /";

describe("Similarweb public provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the public data response when traffic metrics are available", async () => {
    const json = readFileSync("tests/fixtures/similarweb-data-api.json", "utf8");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(robotsTxt, { status: 200 }))
        .mockResolvedValueOnce(new Response(json, { status: 200, headers: { "Content-Type": "application/json" } }))
    );

    const result = await new SimilarwebPublicProvider().collectDomainSnapshot({
      domain: "example.com",
      collectedAt: new Date("2026-06-03T08:00:00.000Z")
    });

    expect(result.status).toBe("success");
    expect(result.metrics.estimatedMonthlyVisits).toBe(1200000);
    expect(result.trafficChannels).toContainEqual({ channel: "direct", sharePercent: 44.2 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not fetch the WAF-prone HTML page after a public data block", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(robotsTxt, { status: 200 }))
        .mockResolvedValueOnce(new Response("Request blocked", { status: 403 }))
    );

    const result = await new SimilarwebPublicProvider().collectDomainSnapshot({
      domain: "example.com",
      collectedAt: new Date("2026-06-03T08:00:00.000Z")
    });

    expect(result.status).toBe("blocked");
    expect(result.warnings).toContain("Similarweb public data response returned HTTP 403.");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
