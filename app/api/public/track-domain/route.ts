import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDisplayNameFromDomain, normalizeDomain } from "@/lib/domains";
import { hasDatabaseUrl } from "@/lib/env";
import {
  checkPublicTrackRateLimit,
  getClientIpFromHeaders,
  publicTrackRateLimitHeaders
} from "@/lib/public-track";
import { prisma } from "@/lib/prisma";
import { scrapeOneTrackedDomain } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const publicTrackDomainSchema = z.object({
  domain: z.string().min(1).max(2048)
});

function normalizeWarnings(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

async function assignOtherCategoryIfUnassigned(trackedDomainId: string) {
  const existingAssignment = await prisma.domainCategoryAssignment.findFirst({
    where: { trackedDomainId },
    select: { id: true }
  });
  if (existingAssignment) return;

  const otherCategory = await prisma.domainCategory.upsert({
    where: { slug: "other" },
    create: { name: "Other", slug: "other" },
    update: {}
  });

  await prisma.domainCategoryAssignment.upsert({
    where: {
      trackedDomainId_domainCategoryId: {
        trackedDomainId,
        domainCategoryId: otherCategory.id
      }
    },
    create: {
      trackedDomainId,
      domainCategoryId: otherCategory.id
    },
    update: {}
  });
}

async function findLatestSnapshot(trackedDomainId: string) {
  return prisma.domainSnapshot.findFirst({
    where: { trackedDomainId },
    orderBy: { collectedAt: "desc" },
    include: {
      trafficChannelSnapshots: true,
      countrySnapshots: true
    }
  });
}

export async function POST(request: NextRequest) {
  const rateLimit = checkPublicTrackRateLimit(getClientIpFromHeaders(request.headers));
  const rateLimitHeaders = publicTrackRateLimitHeaders(rateLimit);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many public domain submissions. Try again after the reset time.",
        resetAt: new Date(rateLimit.resetAt).toISOString()
      },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  const parsed = publicTrackDomainSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  let domain: string;
  try {
    domain = normalizeDomain(parsed.data.domain);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid domain." },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "Database is not configured, so public tracking is unavailable." },
      { status: 503, headers: rateLimitHeaders }
    );
  }

  try {
    const existingDomain = await prisma.trackedDomain.findUnique({
      where: { domain },
      select: { id: true }
    });

    const trackedDomain = await prisma.trackedDomain.upsert({
      where: { domain },
      create: {
        domain,
        displayName: getDisplayNameFromDomain(domain),
        isActive: true,
        notes: "Added from the public tracking form."
      },
      update: {
        isActive: true
      },
      include: {
        categoryAssignments: { include: { category: true } }
      }
    });

    await assignOtherCategoryIfUnassigned(trackedDomain.id);
    const run = await scrapeOneTrackedDomain({ trackedDomainId: trackedDomain.id, force: true });
    const latestSnapshot = await findLatestSnapshot(trackedDomain.id);
    const runItem = run.items[0] ?? null;

    return NextResponse.json(
      {
        domain: {
          id: trackedDomain.id,
          domain: trackedDomain.domain,
          displayName: trackedDomain.displayName ?? trackedDomain.domain,
          isActive: trackedDomain.isActive,
          created: !existingDomain
        },
        weeklyTracker: {
          included: trackedDomain.isActive,
          schedule: "0 8 * * 0"
        },
        run: {
          id: run.id,
          status: run.status,
          itemStatus: runItem?.status ?? null,
          itemError: runItem?.errorMessage ?? null,
          durationMs: runItem?.durationMs ?? null
        },
        snapshot: latestSnapshot
          ? {
              id: latestSnapshot.id,
              provider: latestSnapshot.provider,
              status: latestSnapshot.status,
              collectedAt: latestSnapshot.collectedAt.toISOString(),
              sourceUrl: latestSnapshot.sourceUrl,
              parserVersion: latestSnapshot.parserVersion,
              warnings: normalizeWarnings(latestSnapshot.warningsJson),
              metrics: {
                estimatedMonthlyVisits: latestSnapshot.estimatedMonthlyVisits,
                globalRank: latestSnapshot.globalRank,
                countryRank: latestSnapshot.countryRank,
                categoryRank: latestSnapshot.categoryRank,
                bounceRate: latestSnapshot.bounceRate,
                pagesPerVisit: latestSnapshot.pagesPerVisit,
                averageVisitDurationSeconds: latestSnapshot.averageVisitDurationSeconds
              },
              trafficChannels: latestSnapshot.trafficChannelSnapshots.map((channel) => ({
                channel: channel.channel,
                sharePercent: channel.sharePercent
              })),
              topCountries: latestSnapshot.countrySnapshots.map((country) => ({
                countryCode: country.countryCode,
                countryName: country.countryName,
                sharePercent: country.sharePercent
              }))
            }
          : null
      },
      { status: existingDomain ? 200 : 201, headers: rateLimitHeaders }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Could not add and scrape this domain."
      },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
