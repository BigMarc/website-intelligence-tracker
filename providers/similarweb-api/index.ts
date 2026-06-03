import { env } from "@/lib/env";
import type { ProviderSnapshotResult, ProviderTrafficChannel, WebsiteIntelligenceProvider } from "@/providers/types";

const SIMILARWEB_API_ORIGIN = "https://api.similarweb.com";
const SIMILARWEB_API_PARSER_VERSION = "similarweb-api-v5-v1";

function latestAvailableMonth(date: Date) {
  const month = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 2, 1));
  return `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
}

function metricFromApi(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function objectFromApi(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function latestDataRow(response: unknown) {
  const data = objectFromApi(response)?.data;
  if (!Array.isArray(data)) return null;

  return data
    .map(objectFromApi)
    .filter((row): row is Record<string, unknown> => row !== null)
    .sort((rowA, rowB) => String(rowA.date ?? "").localeCompare(String(rowB.date ?? "")))
    .at(-1) ?? null;
}

function percentFromApi(value: unknown) {
  const parsed = metricFromApi(value);
  if (parsed === null) return null;
  return Number((parsed <= 1 ? parsed * 100 : parsed).toFixed(4));
}

function channelFromSourceType(value: unknown): ProviderTrafficChannel {
  const sourceType = String(value ?? "").toLowerCase();
  if (sourceType.includes("direct")) return "direct";
  if (sourceType.includes("referral")) return "referrals";
  if (sourceType.includes("organic") && sourceType.includes("search")) return "organic_search";
  if (sourceType.includes("paid") && sourceType.includes("search")) return "paid_search";
  if (sourceType.includes("social")) return "social";
  if (sourceType.includes("mail") || sourceType.includes("email")) return "email";
  if (sourceType.includes("display")) return "display_ads";
  return "other";
}

function parseTrafficSources(response: unknown) {
  const data = objectFromApi(response)?.data;
  if (!Array.isArray(data)) return [];

  const visitsByChannel = new Map<ProviderTrafficChannel, number>();
  for (const item of data) {
    const row = objectFromApi(item);
    if (!row) continue;
    const channel = channelFromSourceType(row.source_type);
    const visits = metricFromApi(row.visits);
    if (visits === null || visits <= 0) continue;
    visitsByChannel.set(channel, (visitsByChannel.get(channel) ?? 0) + visits);
  }

  const totalVisits = [...visitsByChannel.values()].reduce((sum, visits) => sum + visits, 0);
  if (totalVisits <= 0) return [];

  return [...visitsByChannel.entries()].map(([channel, visits]) => ({
    channel,
    sharePercent: Number(((visits / totalVisits) * 100).toFixed(4))
  }));
}

function statusFromMetrics(metrics: ProviderSnapshotResult["metrics"]) {
  const foundMetricCount = Object.values(metrics).filter((value) => value !== null && value !== undefined).length;
  return {
    foundMetricCount,
    status: foundMetricCount === 0 ? ("no_public_data" as const) : foundMetricCount >= 3 ? ("success" as const) : ("partial" as const)
  };
}

export class SimilarwebApiProvider implements WebsiteIntelligenceProvider {
  name = "similarweb-api";

  async healthCheck() {
    if (!env.similarwebApiEnabled) {
      return { status: "disabled" as const, message: "Official Similarweb API adapter is disabled by default." };
    }
    if (!env.similarwebApiKey) {
      return { status: "error" as const, message: "SIMILARWEB_API_ENABLED=true but SIMILARWEB_API_KEY is missing." };
    }
    return { status: "ok" as const, message: "Official API adapter boundary is configured." };
  }

  async collectDomainSnapshot(input: { domain: string; collectedAt: Date }): Promise<ProviderSnapshotResult> {
    if (!env.similarwebApiEnabled || !env.similarwebApiKey) {
      return {
        status: "no_public_data",
        sourceUrl: `official-api://${input.domain}`,
        collectedAt: input.collectedAt.toISOString(),
        parserVersion: SIMILARWEB_API_PARSER_VERSION,
        metrics: {},
        warnings: ["Official Similarweb API collection requires SIMILARWEB_API_ENABLED=true and SIMILARWEB_API_KEY."]
      };
    }

    const month = latestAvailableMonth(input.collectedAt);
    const trafficUrl = new URL("/v5/website-analysis/websites/traffic-and-engagement", SIMILARWEB_API_ORIGIN);
    trafficUrl.searchParams.set("domain", input.domain);
    trafficUrl.searchParams.set("start_date", month);
    trafficUrl.searchParams.set("end_date", month);
    trafficUrl.searchParams.set("granularity", "monthly");
    trafficUrl.searchParams.set("web_source", "total");
    trafficUrl.searchParams.set("country", "ww");
    trafficUrl.searchParams.set("metrics", "visits,average_visit_duration,pages_per_visit,bounce_rate");
    trafficUrl.searchParams.set("format", "json");

    const sourcesUrl = new URL("/v5/website-analysis/websites/traffic-sources", SIMILARWEB_API_ORIGIN);
    sourcesUrl.searchParams.set("domain", input.domain);
    sourcesUrl.searchParams.set("start_date", month);
    sourcesUrl.searchParams.set("end_date", month);
    sourcesUrl.searchParams.set("granularity", "monthly");
    sourcesUrl.searchParams.set("web_source", "desktop");
    sourcesUrl.searchParams.set("country", "ww");
    sourcesUrl.searchParams.set("metrics", "visits");
    sourcesUrl.searchParams.set("format", "json");

    const headers = { "api-key": env.similarwebApiKey, Accept: "application/json" };

    try {
      const trafficResponse = await fetch(trafficUrl, { headers });
      const trafficJson = await trafficResponse.json().catch(() => null);
      if (!trafficResponse.ok) {
        return {
          status: trafficResponse.status === 429 ? "blocked" : "network_error",
          sourceUrl: trafficUrl.toString(),
          collectedAt: input.collectedAt.toISOString(),
          parserVersion: SIMILARWEB_API_PARSER_VERSION,
          metrics: {},
          warnings: [`Official Similarweb API traffic response returned HTTP ${trafficResponse.status}.`],
          raw: trafficJson
        };
      }

      const trafficRow = latestDataRow(trafficJson);
      const metrics = {
        estimatedMonthlyVisits: metricFromApi(trafficRow?.visits),
        bounceRate: percentFromApi(trafficRow?.bounce_rate),
        pagesPerVisit: metricFromApi(trafficRow?.pages_per_visit),
        averageVisitDurationSeconds: metricFromApi(trafficRow?.average_visit_duration)
      };
      const { foundMetricCount, status } = statusFromMetrics(metrics);
      const warnings: string[] = [];
      if (foundMetricCount === 0) warnings.push("No traffic metrics were returned by the official Similarweb API.");

      let trafficChannels: ProviderSnapshotResult["trafficChannels"] = [];
      const sourcesResponse = await fetch(sourcesUrl, { headers });
      const sourcesJson = await sourcesResponse.json().catch(() => null);
      if (sourcesResponse.ok) {
        trafficChannels = parseTrafficSources(sourcesJson);
        if (trafficChannels.length === 0) warnings.push("No traffic-source values were returned by the official Similarweb API.");
      } else {
        warnings.push(`Official Similarweb API traffic-sources response returned HTTP ${sourcesResponse.status}.`);
      }

      return {
        status,
        sourceUrl: trafficUrl.toString(),
        collectedAt: input.collectedAt.toISOString(),
        parserVersion: SIMILARWEB_API_PARSER_VERSION,
        metrics,
        trafficChannels,
        warnings,
        raw: {
          traffic: trafficJson,
          trafficSources: sourcesJson
        }
      };
    } catch (error) {
      return {
        status: "network_error",
        sourceUrl: trafficUrl.toString(),
        collectedAt: input.collectedAt.toISOString(),
        parserVersion: SIMILARWEB_API_PARSER_VERSION,
        metrics: {},
        warnings: [error instanceof Error ? error.message : "Official Similarweb API request failed."]
      };
    }
  }
}
