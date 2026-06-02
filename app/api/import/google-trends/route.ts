import { NextResponse, type NextRequest } from "next/server";
import { parseGoogleTrendsCsvRows } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const rows = parseGoogleTrendsCsvRows(await request.text());
  let imported = 0;

  for (const row of rows) {
    if (!row.term || !Number.isFinite(row.interest) || Number.isNaN(row.date.getTime())) continue;
    const term = await prisma.searchTerm.upsert({
      where: { term: row.term },
      create: { term: row.term },
      update: {}
    });
    await prisma.searchInterestSnapshot.upsert({
      where: {
        searchTermId_geo_date: {
          searchTermId: term.id,
          geo: row.geo,
          date: row.date
        }
      },
      create: {
        searchTermId: term.id,
        geo: row.geo,
        date: row.date,
        interest: Math.max(0, Math.min(100, Math.round(row.interest)))
      },
      update: {
        interest: Math.max(0, Math.min(100, Math.round(row.interest)))
      }
    });
    imported += 1;
  }

  return NextResponse.json({ imported });
}
