import { NextResponse, type NextRequest } from "next/server";
import { scrapeOneTrackedDomain } from "@/lib/scraper";
import { requireApiSession } from "@/lib/auth-server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const run = await scrapeOneTrackedDomain({ trackedDomainId: id, force: Boolean(body.force) });
  return NextResponse.json({ run });
}
