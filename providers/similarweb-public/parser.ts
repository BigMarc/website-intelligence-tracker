import * as cheerio from "cheerio";
import { detectPublicPageAccess } from "@/lib/page-detection";
import { parseDurationToSeconds, parseMetricNumber, parsePercent, parseRank } from "@/lib/metrics";
import type { ProviderSnapshotResult, ProviderTrafficChannel } from "@/providers/types";

export const SIMILARWEB_PUBLIC_PARSER_VERSION = "similarweb-public-static-v1";

const channelLabels: Array<[ProviderTrafficChannel, RegExp]> = [
  ["direct", /direct/i],
  ["referrals", /referrals?/i],
  ["organic_search", /organic search|search/i],
  ["paid_search", /paid search/i],
  ["social", /social/i],
  ["email", /email/i],
  ["display_ads", /display ads?|display/i]
];

const countryCodeHints: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Spain: "ES",
  Italy: "IT",
  India: "IN",
  Brazil: "BR",
  Japan: "JP",
  Mexico: "MX"
};

function normalizeBodyText(html: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function findAfterLabels(text: string, labels: RegExp[], valuePattern: RegExp) {
  for (const label of labels) {
    const match = label.exec(text);
    if (!match || match.index === undefined) continue;
    const window = text.slice(match.index, match.index + 180);
    const value = valuePattern.exec(window);
    if (value?.[1]) return value[1];
  }
  return null;
}

function metricFromJson(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return parseMetricNumber(value);
  return null;
}

function flattenJson(value: unknown, path: string[] = [], out: Array<{ path: string; value: unknown }> = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => flattenJson(entry, [...path, String(index)], out));
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) flattenJson(entry, [...path, key], out);
    return out;
  }
  out.push({ path: path.join(".").toLowerCase(), value });
  return out;
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function extractEmbeddedJson(html: string) {
  const $ = cheerio.load(html);
  const blocks: unknown[] = [];
  $('script[type="application/ld+json"], script#__NEXT_DATA__').each((_, element) => {
    const parsed = safeJsonParse($(element).text());
    if (parsed) blocks.push(parsed);
  });
  return blocks;
}

function findJsonMetric(blocks: unknown[], keys: string[]) {
  for (const block of blocks) {
    const flattened = flattenJson(block);
    const entry = flattened.find(({ path, value }) => keys.some((key) => path.includes(key)) && metricFromJson(value) !== null);
    if (entry) return metricFromJson(entry.value);
  }
  return null;
}

function findJsonPercent(blocks: unknown[], keys: string[]) {
  for (const block of blocks) {
    const flattened = flattenJson(block);
    const entry = flattened.find(({ path, value }) => {
      if (!keys.some((key) => path.includes(key))) return false;
      if (typeof value === "number") return Number.isFinite(value);
      if (typeof value === "string") return parsePercent(value) !== null;
      return false;
    });
    if (!entry) continue;
    if (typeof entry.value === "number") return entry.value;
    if (typeof entry.value === "string") return parsePercent(entry.value);
  }
  return null;
}

function parseTrafficChannels(text: string) {
  const channels: ProviderSnapshotResult["trafficChannels"] = [];
  for (const [channel, label] of channelLabels) {
    const match = label.exec(text);
    if (!match || match.index === undefined) continue;
    const window = text.slice(match.index, match.index + 90);
    const percent = parsePercent(window.match(/(-?\d+(?:\.\d+)?)\s*%/)?.[0]);
    if (percent !== null) channels.push({ channel, sharePercent: percent });
  }
  return channels;
}

function parseTopCountries(text: string) {
  const countries: NonNullable<ProviderSnapshotResult["topCountries"]> = [];
  for (const [countryName, countryCode] of Object.entries(countryCodeHints)) {
    const pattern = new RegExp(`${countryName}\\s+(-?\\d+(?:\\.\\d+)?)\\s*%`, "i");
    const match = text.match(pattern);
    if (match?.[1]) countries.push({ countryName, countryCode, sharePercent: Number(match[1]) });
  }
  return countries.slice(0, 10);
}

export function parseSimilarwebHtml(input: {
  html: string;
  domain: string;
  sourceUrl: string;
  collectedAt: Date;
  statusCode?: number;
}): ProviderSnapshotResult {
  const access = detectPublicPageAccess({ html: input.html, statusCode: input.statusCode, url: input.sourceUrl });
  const base = {
    sourceUrl: input.sourceUrl,
    collectedAt: input.collectedAt.toISOString(),
    parserVersion: SIMILARWEB_PUBLIC_PARSER_VERSION,
    warnings: [] as string[]
  };

  if (access.status) {
    return {
      ...base,
      status: access.status,
      metrics: {},
      warnings: [access.reason ?? "Public page access was blocked"]
    };
  }

  const text = normalizeBodyText(input.html);
  const jsonBlocks = extractEmbeddedJson(input.html);
  const estimatedMonthlyVisits =
    findJsonMetric(jsonBlocks, ["estimatedmonthlyvisits", "monthlyvisits", "visits"]) ??
    parseMetricNumber(
      findAfterLabels(text, [/total visits/i, /monthly visits/i, /estimated monthly visits/i], /([#\d.,]+\s*[KMBkmb]?|N\/A)/)
    );
  const globalRank =
    findJsonMetric(jsonBlocks, ["globalrank"]) ??
    parseRank(findAfterLabels(text, [/global rank/i], /(#?\d[\d,]*|N\/A)/));
  const countryRank =
    findJsonMetric(jsonBlocks, ["countryrank"]) ??
    parseRank(findAfterLabels(text, [/country rank/i], /(#?\d[\d,]*|N\/A)/));
  const categoryRank =
    findJsonMetric(jsonBlocks, ["categoryrank"]) ??
    parseRank(findAfterLabels(text, [/category rank/i], /(#?\d[\d,]*|N\/A)/));
  const bounceRate =
    findJsonPercent(jsonBlocks, ["bouncerate"]) ??
    parsePercent(findAfterLabels(text, [/bounce rate/i], /(-?\d+(?:\.\d+)?\s*%|N\/A)/));
  const pagesPerVisit =
    findJsonMetric(jsonBlocks, ["pagespervisit", "pagesvisit"]) ??
    parseMetricNumber(findAfterLabels(text, [/pages per visit/i, /pages\/visit/i], /(\d+(?:\.\d+)?|N\/A)/));
  const averageVisitDurationSeconds =
    findJsonMetric(jsonBlocks, ["averagevisitdurationseconds"]) ??
    parseDurationToSeconds(
      findAfterLabels(text, [/avg visit duration/i, /average visit duration/i, /visit duration/i], /(\d{1,2}:\d{2}(?::\d{2})?|N\/A)/)
    );

  const trafficChannels = parseTrafficChannels(text);
  const topCountries = parseTopCountries(text);
  const metrics = {
    estimatedMonthlyVisits,
    globalRank,
    countryRank,
    categoryRank,
    bounceRate,
    pagesPerVisit,
    averageVisitDurationSeconds
  };
  const foundMetricCount = Object.values(metrics).filter((value) => value !== null && value !== undefined).length;
  const warnings = [...base.warnings];
  if (foundMetricCount === 0) warnings.push("No public metric values were found in static HTML.");
  if (trafficChannels.length === 0) warnings.push("No public traffic-channel values were found.");
  if (topCountries.length === 0) warnings.push("No public country-share values were found.");

  const status = foundMetricCount === 0 ? "no_public_data" : foundMetricCount >= 3 ? "success" : "partial";

  return {
    ...base,
    status,
    metrics,
    trafficChannels,
    topCountries,
    warnings,
    raw: {
      foundMetricCount,
      textLength: text.length,
      embeddedJsonBlocks: jsonBlocks.length
    }
  };
}
