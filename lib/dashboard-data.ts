import { notFound } from "next/navigation";
import { describeGoogleTrendsMode } from "@/providers/google-trends";
import { similarwebPublicProvider } from "@/providers/similarweb-public";
import { UNCATEGORIZED_CATEGORY_FILTER } from "@/lib/categories";
import { getDisplayNameFromDomain } from "@/lib/domains";
import { calculateRankChange, calculateTrafficChange, freshnessLabel } from "@/lib/metrics";
import { env, getPublicEnvStatus, hasDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { seededCategoryDomains } from "@/lib/tracked-catalog";
import { toSlug } from "@/lib/utils";

const sampleSnapshots = [
  {
    id: "sample-s1",
    provider: "similarweb-public",
    collectedAt: new Date("2026-05-19T08:00:00.000Z"),
    status: "success",
    estimatedMonthlyVisits: 124000000,
    globalRank: 210,
    countryRank: 115,
    categoryRank: 4,
    bounceRate: 42.1,
    pagesPerVisit: 4.2,
    averageVisitDurationSeconds: 221,
    warningsJson: [],
    sourceUrl: "https://www.similarweb.com/website/onlyfans.com/",
    parserVersion: "sample-v1",
    trafficChannelSnapshots: [
      { channel: "direct", sharePercent: 54.2 },
      { channel: "organic_search", sharePercent: 24.3 },
      { channel: "social", sharePercent: 10.8 }
    ],
    countrySnapshots: [
      { countryName: "United States", countryCode: "US", sharePercent: 36.2 },
      { countryName: "United Kingdom", countryCode: "GB", sharePercent: 7.4 }
    ]
  },
  {
    id: "sample-s0",
    provider: "similarweb-public",
    collectedAt: new Date("2026-05-12T08:00:00.000Z"),
    status: "success",
    estimatedMonthlyVisits: 118000000,
    globalRank: 224,
    countryRank: 120,
    categoryRank: 4,
    bounceRate: 43.0,
    pagesPerVisit: 4.1,
    averageVisitDurationSeconds: 215,
    warningsJson: [],
    sourceUrl: "https://www.similarweb.com/website/onlyfans.com/",
    parserVersion: "sample-v1",
    trafficChannelSnapshots: [],
    countrySnapshots: []
  }
];

const sampleSnapshotsByDomain: Record<string, any[]> = {
  "onlyfans.com": sampleSnapshots,
  "linktr.ee": [
    {
      ...sampleSnapshots[0],
      id: "sample-l1",
      estimatedMonthlyVisits: 86000000,
      globalRank: 350,
      status: "partial",
      warningsJson: ["Country shares were not public in static HTML."],
      trafficChannelSnapshots: [{ channel: "organic_search", sharePercent: 46.8 }]
    },
    {
      ...sampleSnapshots[1],
      id: "sample-l0",
      estimatedMonthlyVisits: 90000000,
      globalRank: 340
    }
  ],
  "fansly.com": [
    {
      ...sampleSnapshots[0],
      id: "sample-f1",
      status: "no_public_data",
      estimatedMonthlyVisits: null,
      globalRank: null,
      warningsJson: ["No public metric values were found in static HTML."],
      trafficChannelSnapshots: []
    }
  ]
};

function sampleCategoryId(name: string) {
  return `cat-${toSlug(name)}`;
}

const sampleCategoriesByName = new Map(
  seededCategoryDomains.map(({ name }) => [
    name,
    {
      id: sampleCategoryId(name),
      name,
      slug: toSlug(name),
      _count: { assignments: 0 }
    }
  ])
);

const sampleDomainCategories = new Map<string, any>();

for (const { name, domains } of seededCategoryDomains) {
  const category = sampleCategoriesByName.get(name);
  if (!category) continue;
  for (const domain of domains) {
    sampleDomainCategories.set(domain, category);
  }
}

const sampleCategories: any[] = [...sampleCategoriesByName.values()].map((category) => ({
  ...category,
  _count: {
    assignments: [...sampleDomainCategories.values()].filter((assignedCategory) => assignedCategory.id === category.id).length
  }
}));

const sampleDomains: any[] = [...sampleDomainCategories.entries()]
  .sort(([domainA], [domainB]) => domainA.localeCompare(domainB))
  .map(([domain, category]) => ({
    id: `sample-${toSlug(domain)}`,
    domain,
    displayName: getDisplayNameFromDomain(domain),
    isActive: true,
    notes: "Seed sample",
    categoryAssignments: [{ category }],
    snapshots: sampleSnapshotsByDomain[domain] ?? []
  }));

async function dbOrSample<T>(sample: T, fn: () => Promise<unknown>): Promise<T> {
  if (!hasDatabaseUrl()) return sample;
  try {
    return (await fn()) as T;
  } catch {
    return sample;
  }
}

function normalizeWarnings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function domainCategory(domain: any) {
  return domain.categoryAssignments?.[0]?.category?.name ?? "Other";
}

function mapDomainRow(domain: any) {
  const categories = (domain.categoryAssignments ?? []).map((assignment: any) => assignment.category).filter(Boolean);
  const snapshots = [...(domain.snapshots ?? [])].sort(
    (a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
  );
  const latest = snapshots[0] ?? null;
  const previous = snapshots[1] ?? null;
  const trafficChange = calculateTrafficChange({
    latestValue: latest?.estimatedMonthlyVisits,
    previousValue: previous?.estimatedMonthlyVisits
  });
  const rankChange = calculateRankChange(latest?.globalRank, previous?.globalRank);
  const leadingChannel = latest?.trafficChannelSnapshots?.length
    ? [...latest.trafficChannelSnapshots].sort((a, b) => b.sharePercent - a.sharePercent)[0]
    : null;

  return {
    id: domain.id,
    domain: domain.domain,
    displayName: domain.displayName ?? domain.domain,
    isActive: domain.isActive,
    notes: domain.notes ?? "",
    category: domainCategory(domain),
    categoryId: categories[0]?.id ?? "",
    categoryIds: categories.map((category: any) => category.id),
    latest,
    previous,
    absoluteVisitChange: trafficChange.absoluteVisitChange,
    percentageVisitChange: trafficChange.percentageVisitChange,
    rankChange,
    dataFreshness: freshnessLabel(latest?.collectedAt),
    leadingChannel,
    warnings: normalizeWarnings(latest?.warningsJson),
    history: snapshots
      .slice()
      .reverse()
      .map((snapshot) => ({
        date: new Date(snapshot.collectedAt).toISOString().slice(0, 10),
        visits: snapshot.estimatedMonthlyVisits,
        globalRank: snapshot.globalRank
      }))
  };
}

async function loadDomains() {
  return dbOrSample(sampleDomains, () =>
    prisma.trackedDomain.findMany({
      orderBy: { domain: "asc" },
      include: {
        categoryAssignments: { include: { category: true } },
        snapshots: {
          orderBy: { collectedAt: "desc" },
          take: 24,
          include: {
            trafficChannelSnapshots: true,
            countrySnapshots: true
          }
        }
      }
    })
  );
}

async function loadCategories() {
  return dbOrSample(sampleCategories, () =>
    prisma.domainCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { assignments: true } } } })
  );
}

function normalizeOverviewCategoryFilter(categoryFilter: string | null | undefined, categories: any[]) {
  const value = categoryFilter?.trim() ?? "";
  if (!value) return "";
  if (value === UNCATEGORIZED_CATEGORY_FILTER) return value;
  return categories.some((category) => category.id === value) ? value : "";
}

function filterRowsByCategory(rows: ReturnType<typeof mapDomainRow>[], categoryFilter: string) {
  if (!categoryFilter) return rows;
  if (categoryFilter === UNCATEGORIZED_CATEGORY_FILTER) {
    return rows.filter((row) => row.categoryIds.length === 0);
  }
  return rows.filter((row) => row.categoryIds.includes(categoryFilter));
}

export async function getOverviewData(categoryFilter?: string | null) {
  const [domains, categories] = await Promise.all([loadDomains(), loadCategories()]);
  const rows = domains.map(mapDomainRow);
  const selectedCategoryId = normalizeOverviewCategoryFilter(categoryFilter, categories);
  const filteredRows = filterRowsByCategory(rows, selectedCategoryId);
  const latestStatuses = filteredRows.map((row) => row.latest?.status).filter(Boolean);
  const latestRun = await dbOrSample(null as any, () =>
    prisma.scrapeRun.findFirst({ orderBy: { startedAt: "desc" }, include: { items: true } })
  );
  return {
    cards: {
      trackedWebsites: filteredRows.length,
      latestSuccessfulSnapshots: latestStatuses.filter((status) => status === "success").length,
      partialData: latestStatuses.filter((status) => status === "partial").length,
      noPublicData: latestStatuses.filter((status) => status === "no_public_data").length,
      reviewRequired: latestStatuses.filter((status) =>
        ["blocked", "login_wall", "captcha", "parser_error", "network_error"].includes(String(status))
      ).length,
      latestRun
    },
    categories,
    selectedCategoryId,
    totalRows: rows.length,
    rows: filteredRows
  };
}

export async function getDomainsPageData() {
  const [domains, categories] = await Promise.all([
    loadDomains(),
    loadCategories()
  ]);
  return { domains: domains.map(mapDomainRow), categories };
}

export async function getDomainDetailData(id: string) {
  const domains = await loadDomains();
  const domain = domains.find((item) => item.id === id);
  if (!domain) notFound();
  const row = mapDomainRow(domain);
  return {
    ...row,
    snapshots: (domain.snapshots ?? []).map((snapshot: any) => ({
      ...snapshot,
      warnings: normalizeWarnings(snapshot.warningsJson),
      rawJson: snapshot.rawJson ?? snapshot
    }))
  };
}

export async function getCategoriesData() {
  return loadCategories();
}

export async function getComparisonData(selectedIds: string[] = []) {
  const domains = (await loadDomains()).map(mapDomainRow);
  const selected = (selectedIds.length ? domains.filter((domain) => selectedIds.includes(domain.id)) : domains).slice(0, 5);
  const allDates = [...new Set(selected.flatMap((domain) => domain.history.map((point) => point.date)))].sort();
  const chartData = allDates.map((date) => {
    const point: Record<string, string | number | null> = { date };
    selected.forEach((domain) => {
      point[domain.domain] = domain.history.find((entry) => entry.date === date)?.visits ?? null;
    });
    return point;
  });
  return { domains, selected, chartData };
}

export async function getRunsData() {
  return dbOrSample([], () =>
    prisma.scrapeRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { items: { include: { trackedDomain: true } } }
    })
  );
}

export async function getRunDetailData(id: string) {
  const run = await dbOrSample(null as any, () =>
    prisma.scrapeRun.findUnique({
      where: { id },
      include: { items: { include: { trackedDomain: true } } }
    })
  );
  if (!run) notFound();
  return run;
}

export async function getTrendsData() {
  return dbOrSample([], () =>
    prisma.searchTerm.findMany({
      orderBy: { term: "asc" },
      include: { snapshots: { orderBy: { date: "desc" }, take: 36 } }
    })
  );
}

export async function getAlertsData() {
  return dbOrSample({ rules: [], events: [] }, async () => ({
    rules: await prisma.alertRule.findMany({ orderBy: { createdAt: "desc" }, include: { trackedDomain: true } }),
    events: await prisma.alertEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { trackedDomain: true, alertRule: true }
    })
  }));
}

export async function getSettingsData() {
  const providerHealth = await similarwebPublicProvider.healthCheck();
  return {
    envStatus: getPublicEnvStatus(),
    providerHealth,
    googleTrends: describeGoogleTrendsMode(),
    cronSchedule: "0 8 * * 0",
    webCommand: "npm run start",
    cronCommand: "npm run scrape:all",
    requestConfig: {
      delayMs: env.requestDelayMs,
      jitterMs: env.requestJitterMs,
      timeoutMs: env.requestTimeoutMs,
      maxRetries: env.maxRetries
    }
  };
}
