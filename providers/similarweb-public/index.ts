import { env } from "@/lib/env";
import type { ProviderSnapshotResult, WebsiteIntelligenceProvider } from "@/providers/types";
import { checkSimilarwebRobots, USER_AGENT } from "./robots";
import { parseSimilarwebDataApiJson, parseSimilarwebHtml, SIMILARWEB_PUBLIC_PARSER_VERSION } from "./parser";

const SIMILARWEB_ORIGIN = "https://www.similarweb.com";
const SIMILARWEB_DATA_ORIGIN = "https://data.similarweb.com";
const DATA_USER_AGENT = "Mozilla/5.0 (compatible; WebsiteIntelligenceTracker/1.0; +weekly public-data research tool)";
const dataBlockStatusCodes = new Set([403, 429]);

function sourcePath(domain: string) {
  return `/website/${domain}/`;
}

function sourceUrl(domain: string) {
  return `${SIMILARWEB_ORIGIN}${sourcePath(domain)}`;
}

function dataUrl(domain: string) {
  return `${SIMILARWEB_DATA_ORIGIN}/api/v1/data?domain=${encodeURIComponent(domain)}`;
}

function failureResult(input: {
  status: ProviderSnapshotResult["status"];
  domain: string;
  collectedAt: Date;
  warning: string;
}) {
  return {
    status: input.status,
    sourceUrl: sourceUrl(input.domain),
    collectedAt: input.collectedAt.toISOString(),
    parserVersion: SIMILARWEB_PUBLIC_PARSER_VERSION,
    metrics: {},
    warnings: [input.warning]
  } satisfies ProviderSnapshotResult;
}

export class SimilarwebPublicProvider implements WebsiteIntelligenceProvider {
  name = "similarweb-public";

  async healthCheck() {
    if (!env.similarwebPublicEnabled) {
      return { status: "disabled" as const, message: "SIMILARWEB_PUBLIC_ENABLED=false" };
    }
    return { status: "ok" as const, message: "Static public collector enabled" };
  }

  async collectDomainSnapshot(input: { domain: string; collectedAt: Date }): Promise<ProviderSnapshotResult> {
    if (!env.similarwebPublicEnabled) {
      return failureResult({
        status: "no_public_data",
        domain: input.domain,
        collectedAt: input.collectedAt,
        warning: "Similarweb public collector is disabled."
      });
    }

    const path = sourcePath(input.domain);
    const robots = await checkSimilarwebRobots(path, Math.min(env.requestTimeoutMs, 15000));
    if (!robots.allowed) {
      return failureResult({
        status: "blocked",
        domain: input.domain,
        collectedAt: input.collectedAt,
        warning: robots.warning ?? "robots.txt disallows this public page."
      });
    }

    let lastError: string | null = null;
    for (let attempt = 0; attempt <= env.maxRetries; attempt += 1) {
      const dataController = new AbortController();
      const dataTimeout = setTimeout(() => dataController.abort(), env.requestTimeoutMs);
      try {
        const response = await fetch(dataUrl(input.domain), {
          headers: {
            "User-Agent": DATA_USER_AGENT,
            Accept: "application/json",
            "Accept-Language": "en-US,en;q=0.9"
          },
          signal: dataController.signal
        });
        if (response.ok) {
          const parsed = parseSimilarwebDataApiJson({
            json: await response.json(),
            domain: input.domain,
            sourceUrl: dataUrl(input.domain),
            collectedAt: input.collectedAt,
            statusCode: response.status
          });
          if (parsed.status !== "no_public_data" && parsed.status !== "parser_error") {
            return {
              ...parsed,
              warnings: robots.warning ? [robots.warning, ...parsed.warnings] : parsed.warnings
            };
          }
          lastError = parsed.warnings.join(" ");
        } else if (dataBlockStatusCodes.has(response.status)) {
          return {
            status: "blocked",
            sourceUrl: dataUrl(input.domain),
            collectedAt: input.collectedAt.toISOString(),
            parserVersion: SIMILARWEB_PUBLIC_PARSER_VERSION,
            metrics: {},
            warnings: [
              robots.warning,
              `Similarweb public data response returned HTTP ${response.status}.`
            ].filter((warning): warning is string => Boolean(warning))
          };
        } else {
          lastError = `Similarweb public data response returned HTTP ${response.status}.`;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "unknown data response error";
      } finally {
        clearTimeout(dataTimeout);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), env.requestTimeoutMs);
      try {
        const response = await fetch(sourceUrl(input.domain), {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml"
          },
          signal: controller.signal
        });
        const html = await response.text();
        const parsed = parseSimilarwebHtml({
          html,
          domain: input.domain,
          sourceUrl: sourceUrl(input.domain),
          collectedAt: input.collectedAt,
          statusCode: response.status
        });
        return {
          ...parsed,
          warnings: [robots.warning, lastError, ...parsed.warnings].filter((warning): warning is string =>
            Boolean(warning)
          )
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : "unknown network error";
      } finally {
        clearTimeout(timeout);
      }
    }

    return failureResult({
      status: "network_error",
      domain: input.domain,
      collectedAt: input.collectedAt,
      warning: lastError ?? "Network request failed."
    });
  }
}

export const similarwebPublicProvider = new SimilarwebPublicProvider();
