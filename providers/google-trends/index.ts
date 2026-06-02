import { env } from "@/lib/env";

export function getGoogleTrendsMode() {
  if (!["disabled", "manual_csv", "official_alpha_api"].includes(env.googleTrendsMode)) return "disabled";
  return env.googleTrendsMode as "disabled" | "manual_csv" | "official_alpha_api";
}

export function describeGoogleTrendsMode() {
  const mode = getGoogleTrendsMode();
  if (mode === "manual_csv") return "Manual CSV import for relative brand-search interest is enabled.";
  if (mode === "official_alpha_api") {
    return "Official Google Trends API placeholder is selected. Hidden Google frontend endpoints are not scraped.";
  }
  return "Google Trends collection is disabled.";
}
