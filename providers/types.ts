export type ProviderSnapshotStatus =
  | "success"
  | "partial"
  | "no_public_data"
  | "blocked"
  | "login_wall"
  | "captcha"
  | "parser_error"
  | "network_error";

export type ProviderTrafficChannel =
  | "direct"
  | "referrals"
  | "organic_search"
  | "paid_search"
  | "social"
  | "email"
  | "display_ads"
  | "other";

export type ProviderSnapshotResult = {
  status: ProviderSnapshotStatus;
  sourceUrl: string;
  collectedAt: string;
  parserVersion: string;
  metrics: {
    estimatedMonthlyVisits?: number | null;
    globalRank?: number | null;
    countryRank?: number | null;
    categoryRank?: number | null;
    bounceRate?: number | null;
    pagesPerVisit?: number | null;
    averageVisitDurationSeconds?: number | null;
  };
  trafficChannels?: Array<{
    channel: ProviderTrafficChannel;
    sharePercent: number;
  }>;
  topCountries?: Array<{
    countryCode?: string | null;
    countryName: string;
    sharePercent?: number | null;
  }>;
  warnings: string[];
  raw?: unknown;
};

export interface WebsiteIntelligenceProvider {
  name: string;
  collectDomainSnapshot(input: { domain: string; collectedAt: Date }): Promise<ProviderSnapshotResult>;
  healthCheck(): Promise<{ status: "ok" | "disabled" | "error"; message: string }>;
}
