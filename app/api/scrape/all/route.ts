import { NextResponse, type NextRequest } from "next/server";
import { scrapeAllTrackedDomains } from "@/lib/scraper";
import { requireApiSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => ({}));
  try {
    const run = await scrapeAllTrackedDomains({ force: Boolean(body.force) });
    return NextResponse.json({ run });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Manual scrape failed." },
      { status: 500 }
    );
  }
}
