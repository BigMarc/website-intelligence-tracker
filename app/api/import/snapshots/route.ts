import { NextResponse, type NextRequest } from "next/server";
import { getDisplayNameFromDomain } from "@/lib/domains";
import { parseSnapshotCsvRows } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { createSnapshotFromProviderResult } from "@/lib/scraper";
import { requireApiSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const text = await request.text();
  const rows = parseSnapshotCsvRows(text);
  const imported = [];

  for (const row of rows) {
    const trackedDomain = await prisma.trackedDomain.upsert({
      where: { domain: row.domain },
      create: { domain: row.domain, displayName: getDisplayNameFromDomain(row.domain) },
      update: {}
    });
    const metricCount = Object.values(row.metrics).filter((value) => value !== null && value !== undefined).length;
    const saved = await createSnapshotFromProviderResult({
      trackedDomainId: trackedDomain.id,
      providerName: row.provider,
      force: true,
      result: {
        status: metricCount > 0 ? "success" : "no_public_data",
        sourceUrl: row.sourceUrl,
        collectedAt: row.collectedAt.toISOString(),
        parserVersion: "manual-csv-v1",
        metrics: row.metrics,
        warnings: metricCount > 0 ? [] : ["Manual CSV row did not include public metrics."]
      }
    });
    imported.push(saved.snapshot?.id);
  }

  return NextResponse.json({ imported: imported.length });
}
