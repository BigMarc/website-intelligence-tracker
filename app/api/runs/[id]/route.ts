import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth-server";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const run = await prisma.scrapeRun.findUniqueOrThrow({
    where: { id },
    include: { items: { include: { trackedDomain: true } } }
  });
  return NextResponse.json({ run });
}
