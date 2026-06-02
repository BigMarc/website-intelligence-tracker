import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { normalizeDomain, getDisplayNameFromDomain } from "@/lib/domains";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth-server";

const createDomainSchema = z.object({
  domain: z.string(),
  displayName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable()
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const domains = await prisma.trackedDomain.findMany({
    orderBy: { domain: "asc" },
    include: {
      categoryAssignments: { include: { category: true } },
      snapshots: { orderBy: { collectedAt: "desc" }, take: 1 }
    }
  });
  return NextResponse.json({ domains });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const payload = createDomainSchema.parse(await request.json());
  const domain = normalizeDomain(payload.domain);
  const trackedDomain = await prisma.trackedDomain.create({
    data: {
      domain,
      displayName: payload.displayName?.trim() || getDisplayNameFromDomain(domain),
      notes: payload.notes?.trim() || null,
      categoryAssignments: payload.categoryId
        ? {
            create: {
              domainCategoryId: payload.categoryId
            }
          }
        : undefined
    },
    include: { categoryAssignments: { include: { category: true } } }
  });
  return NextResponse.json({ domain: trackedDomain }, { status: 201 });
}
