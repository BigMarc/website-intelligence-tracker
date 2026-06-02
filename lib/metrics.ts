export type TrafficChangeInput = {
  latestValue?: number | null;
  previousValue?: number | null;
};

const missingPattern = /^(?:n\/a|na|not available|unavailable|-|--|unknown)$/i;

export function cleanMetricText(input: string | null | undefined) {
  if (!input) return "";
  return input.replace(/\u00a0/g, " ").trim();
}

export function parseMetricNumber(input: string | null | undefined): number | null {
  const text = cleanMetricText(input);
  if (!text || missingPattern.test(text)) return null;
  const match = text.replace(/,/g, "").match(/#?\$?\s*(-?\d+(?:\.\d+)?)\s*([kmb])?/i);
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;
  const suffix = match[2]?.toLowerCase();
  const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : suffix === "b" ? 1_000_000_000 : 1;
  return base * multiplier;
}

export function parsePercent(input: string | null | undefined): number | null {
  const text = cleanMetricText(input);
  if (!text || missingPattern.test(text)) return null;
  const match = text.replace(/,/g, "").match(/(-?\d+(?:\.\d+)?)\s*%?/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDurationToSeconds(input: string | null | undefined): number | null {
  const text = cleanMetricText(input);
  if (!text || missingPattern.test(text)) return null;
  const parts = text.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? null;
}

export function parseRank(input: string | null | undefined): number | null {
  const parsed = parseMetricNumber(cleanMetricText(input).replace(/^#/, ""));
  return parsed === null ? null : Math.round(parsed);
}

export function calculateTrafficChange({ latestValue, previousValue }: TrafficChangeInput) {
  const absoluteVisitChange =
    latestValue !== null &&
    latestValue !== undefined &&
    previousValue !== null &&
    previousValue !== undefined
      ? latestValue - previousValue
      : null;

  const percentageVisitChange =
    previousValue !== null &&
    previousValue !== undefined &&
    previousValue > 0 &&
    latestValue !== null &&
    latestValue !== undefined
      ? ((latestValue - previousValue) / previousValue) * 100
      : null;

  return { absoluteVisitChange, percentageVisitChange };
}

export function calculateRankChange(latestRank?: number | null, previousRank?: number | null) {
  if (latestRank === null || latestRank === undefined || previousRank === null || previousRank === undefined) {
    return null;
  }
  return previousRank - latestRank;
}

export function getSnapshotDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function freshnessLabel(collectedAt?: Date | string | null) {
  if (!collectedAt) return "No data";
  const date = typeof collectedAt === "string" ? new Date(collectedAt) : collectedAt;
  const ageMs = Date.now() - date.getTime();
  const days = Math.floor(ageMs / 86_400_000);
  if (days <= 7) return "Fresh";
  if (days <= 31) return "Aging";
  return "Stale";
}
