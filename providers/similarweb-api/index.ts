import { env } from "@/lib/env";
import type { ProviderSnapshotResult, WebsiteIntelligenceProvider } from "@/providers/types";

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
    return {
      status: "no_public_data",
      sourceUrl: `official-api://${input.domain}`,
      collectedAt: input.collectedAt.toISOString(),
      parserVersion: "similarweb-api-placeholder-v1",
      metrics: {},
      warnings: [
        "Official Similarweb API collection is intentionally not implemented in this open-source default. Add a documented API client here when you have licensed API access."
      ]
    };
  }
}
