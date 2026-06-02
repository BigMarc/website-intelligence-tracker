import type { ProviderSnapshotResult, WebsiteIntelligenceProvider } from "@/providers/types";
import { env, hasDatabaseUrl } from "@/lib/env";
import { getSnapshotDate } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { structuredLog } from "@/lib/logger";
import { similarwebPublicProvider } from "@/providers/similarweb-public";
import { sendTelegramMessage } from "@/lib/telegram";
import { evaluateAlertsForSnapshot } from "@/lib/alerts";

const terminalFailureStatuses = new Set(["blocked", "captcha", "login_wall", "parser_error", "network_error"]);

export function delayForRequest(index: number) {
  if (index === 0) return 0;
  const jitter = env.requestJitterMs > 0 ? Math.floor(Math.random() * env.requestJitterMs) : 0;
  return env.requestDelayMs + jitter;
}

export function shouldSkipDuplicateSnapshot(input: { existingSnapshotId?: string | null; force?: boolean }) {
  return Boolean(input.existingSnapshotId && !input.force);
}

function countMetrics(result: ProviderSnapshotResult) {
  return Object.values(result.metrics).filter((value) => value !== null && value !== undefined).length;
}

async function sleep(ms: number) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createSnapshotFromProviderResult(input: {
  trackedDomainId: string;
  providerName: string;
  result: ProviderSnapshotResult;
  force?: boolean;
}) {
  const collectedAt = new Date(input.result.collectedAt);
  const snapshotDate = getSnapshotDate(collectedAt);
  const existing = await prisma.domainSnapshot.findUnique({
    where: {
      trackedDomainId_provider_snapshotDate: {
        trackedDomainId: input.trackedDomainId,
        provider: input.providerName,
        snapshotDate
      }
    }
  });

  if (shouldSkipDuplicateSnapshot({ existingSnapshotId: existing?.id, force: input.force })) {
    return { snapshot: existing, skippedDuplicate: true };
  }

  if (existing && input.force) {
    await prisma.domainSnapshot.delete({ where: { id: existing.id } });
  }

  const snapshot = await prisma.domainSnapshot.create({
    data: {
      trackedDomainId: input.trackedDomainId,
      provider: input.providerName,
      snapshotDate,
      collectedAt,
      sourceUrl: input.result.sourceUrl,
      status: input.result.status,
      parserVersion: input.result.parserVersion,
      estimatedMonthlyVisits: input.result.metrics.estimatedMonthlyVisits ?? null,
      globalRank: input.result.metrics.globalRank ?? null,
      countryRank: input.result.metrics.countryRank ?? null,
      categoryRank: input.result.metrics.categoryRank ?? null,
      bounceRate: input.result.metrics.bounceRate ?? null,
      pagesPerVisit: input.result.metrics.pagesPerVisit ?? null,
      averageVisitDurationSeconds: input.result.metrics.averageVisitDurationSeconds ?? null,
      warningsJson: input.result.warnings,
      rawJson: input.result.raw ?? input.result,
      trafficChannelSnapshots: {
        create: (input.result.trafficChannels ?? []).map((channel) => ({
          channel: channel.channel,
          sharePercent: channel.sharePercent
        }))
      },
      countrySnapshots: {
        create: (input.result.topCountries ?? []).map((country) => ({
          countryCode: country.countryCode ?? null,
          countryName: country.countryName,
          sharePercent: country.sharePercent ?? null
        }))
      }
    },
    include: { trackedDomain: true }
  });

  await evaluateAlertsForSnapshot(snapshot);
  return { snapshot, skippedDuplicate: false };
}

function runStatusFromCounts(counts: {
  domainsAttempted: number;
  domainsSucceeded: number;
  domainsPartial: number;
  domainsFailed: number;
  domainsBlocked: number;
}) {
  if (counts.domainsAttempted === 0) return "success" as const;
  if (counts.domainsFailed > 0 || counts.domainsBlocked > 0 || counts.domainsPartial > 0) return "partial" as const;
  return "success" as const;
}

function applyStatusCount(counts: {
  domainsSucceeded: number;
  domainsPartial: number;
  domainsBlocked: number;
  domainsFailed: number;
}, status: ProviderSnapshotResult["status"]) {
  if (status === "success") counts.domainsSucceeded += 1;
  else if (status === "partial" || status === "no_public_data") counts.domainsPartial += 1;
  else if (status === "blocked" || status === "captcha" || status === "login_wall") counts.domainsBlocked += 1;
  else counts.domainsFailed += 1;
}

export async function collectStandaloneDomain(domain: string, provider: WebsiteIntelligenceProvider = similarwebPublicProvider) {
  return provider.collectDomainSnapshot({ domain, collectedAt: new Date() });
}

async function scrapeDomainInRun(input: {
  runId: string;
  trackedDomainId: string;
  domain: string;
  provider: WebsiteIntelligenceProvider;
  force?: boolean;
}) {
  const started = Date.now();
  try {
    const result = await input.provider.collectDomainSnapshot({ domain: input.domain, collectedAt: new Date() });
    const durationMs = Date.now() - started;
    const saved = await createSnapshotFromProviderResult({
      trackedDomainId: input.trackedDomainId,
      providerName: input.provider.name,
      result,
      force: input.force
    });
    await prisma.scrapeRunItem.create({
      data: {
        scrapeRunId: input.runId,
        trackedDomainId: input.trackedDomainId,
        status: result.status,
        errorMessage: saved.skippedDuplicate ? "Duplicate snapshot skipped for this date." : null,
        durationMs
      }
    });
    structuredLog({
      runId: input.runId,
      domain: input.domain,
      provider: input.provider.name,
      status: result.status,
      durationMs,
      parserVersion: result.parserVersion,
      metricsFound: countMetrics(result),
      warnings: result.warnings
    });
    return result.status;
  } catch (error) {
    const durationMs = Date.now() - started;
    await prisma.scrapeRunItem.create({
      data: {
        scrapeRunId: input.runId,
        trackedDomainId: input.trackedDomainId,
        status: "parser_error",
        errorMessage: error instanceof Error ? error.message : "Unknown scraper error",
        durationMs
      }
    });
    structuredLog({
      runId: input.runId,
      domain: input.domain,
      provider: input.provider.name,
      status: "parser_error",
      durationMs,
      warnings: [error instanceof Error ? error.message : "Unknown scraper error"]
    });
    return "parser_error" as ProviderSnapshotResult["status"];
  }
}

export async function scrapeOneTrackedDomain(input: {
  trackedDomainId: string;
  provider?: WebsiteIntelligenceProvider;
  force?: boolean;
}) {
  if (!hasDatabaseUrl()) throw new Error("DATABASE_URL is required to persist scraper results.");
  const provider = input.provider ?? similarwebPublicProvider;
  const domain = await prisma.trackedDomain.findUniqueOrThrow({ where: { id: input.trackedDomainId } });
  const run = await prisma.scrapeRun.create({ data: { status: "running", domainsAttempted: 1 } });
  const status = await scrapeDomainInRun({
    runId: run.id,
    trackedDomainId: domain.id,
    domain: domain.domain,
    provider,
    force: input.force
  });
  const counts = { domainsSucceeded: 0, domainsPartial: 0, domainsBlocked: 0, domainsFailed: 0 };
  applyStatusCount(counts, status);
  return prisma.scrapeRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      status: runStatusFromCounts({ domainsAttempted: 1, ...counts }),
      ...counts
    },
    include: { items: true }
  });
}

export async function scrapeAllTrackedDomains(input: {
  provider?: WebsiteIntelligenceProvider;
  force?: boolean;
} = {}) {
  if (!hasDatabaseUrl()) throw new Error("DATABASE_URL is required to persist scraper results.");
  const provider = input.provider ?? similarwebPublicProvider;
  const domains = await prisma.trackedDomain.findMany({ where: { isActive: true }, orderBy: { domain: "asc" } });
  const run = await prisma.scrapeRun.create({
    data: { status: "running", domainsAttempted: domains.length }
  });
  const counts = { domainsSucceeded: 0, domainsPartial: 0, domainsBlocked: 0, domainsFailed: 0 };

  for (const [index, domain] of domains.entries()) {
    await sleep(delayForRequest(index));
    const status = await scrapeDomainInRun({
      runId: run.id,
      trackedDomainId: domain.id,
      domain: domain.domain,
      provider,
      force: input.force
    });
    applyStatusCount(counts, status);
  }

  const finished = await prisma.scrapeRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      status: runStatusFromCounts({ domainsAttempted: domains.length, ...counts }),
      ...counts
    },
    include: { items: { include: { trackedDomain: true } } }
  });

  await sendTelegramWeeklySummary(finished);
  return finished;
}

type RunWithItems = {
  domainsAttempted: number;
  domainsSucceeded: number;
  domainsPartial: number;
  domainsBlocked: number;
  domainsFailed: number;
  items: Array<{
    status: string;
    trackedDomain: { domain: string };
  }>;
};

async function sendTelegramWeeklySummary(run: RunWithItems) {
  const review = run.items
    .filter((item) => terminalFailureStatuses.has(item.status))
    .map((item) => `- ${item.trackedDomain.domain}: ${item.status}`)
    .slice(0, 10);

  const message = [
    "Website Intelligence - Weekly Update",
    `Tracked domains: ${run.domainsAttempted}`,
    `Successful: ${run.domainsSucceeded}`,
    `Partial: ${run.domainsPartial}`,
    `Blocked: ${run.domainsBlocked}`,
    `Failed: ${run.domainsFailed}`,
    "Review required:",
    review.length ? review.join("\n") : "- None"
  ].join("\n");

  await sendTelegramMessage(message);
}
