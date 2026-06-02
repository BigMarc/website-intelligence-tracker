import { NextResponse, type NextRequest } from "next/server";
import { rowsToCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const snapshots = await prisma.domainSnapshot.findMany({
    orderBy: { collectedAt: "desc" },
    include: { trackedDomain: true },
    take: 5000
  });
  const headers = [
    "domain",
    "provider",
    "collectedAt",
    "status",
    "estimatedMonthlyVisits",
    "globalRank",
    "countryRank",
    "categoryRank",
    "bounceRate",
    "pagesPerVisit",
    "averageVisitDurationSeconds",
    "sourceUrl"
  ];
  const csv = rowsToCsv(
    snapshots.map((snapshot) => ({
      domain: snapshot.trackedDomain.domain,
      provider: snapshot.provider,
      collectedAt: snapshot.collectedAt.toISOString(),
      status: snapshot.status,
      estimatedMonthlyVisits: snapshot.estimatedMonthlyVisits,
      globalRank: snapshot.globalRank,
      countryRank: snapshot.countryRank,
      categoryRank: snapshot.categoryRank,
      bounceRate: snapshot.bounceRate,
      pagesPerVisit: snapshot.pagesPerVisit,
      averageVisitDurationSeconds: snapshot.averageVisitDurationSeconds,
      sourceUrl: snapshot.sourceUrl
    })),
    headers
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="website-intelligence-snapshots.csv"'
    }
  });
}
