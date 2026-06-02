import { NextResponse, type NextRequest } from "next/server";
import { scrapeAllTrackedDomains } from "@/lib/scraper";
import { requireApiSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => ({}));
  const run = await scrapeAllTrackedDomains({ force: Boolean(body.force) });
  return NextResponse.json({ run });
}
