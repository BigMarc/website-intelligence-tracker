import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { normalizeDomain } from "@/lib/domains";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth-server";

const updateDomainSchema = z.object({
  domain: z.string().optional(),
  displayName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional().nullable()
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const payload = updateDomainSchema.parse(await request.json());
  const data = {
    ...(payload.domain ? { domain: normalizeDomain(payload.domain) } : {}),
    ...(payload.displayName !== undefined ? { displayName: payload.displayName?.trim() || null } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes?.trim() || null } : {}),
    ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {})
  };

  const updated = await prisma.$transaction(async (tx) => {
    const domain = await tx.trackedDomain.update({ where: { id }, data });
    if (payload.categoryId !== undefined) {
      await tx.domainCategoryAssignment.deleteMany({ where: { trackedDomainId: id } });
      if (payload.categoryId) {
        await tx.domainCategoryAssignment.create({
          data: { trackedDomainId: id, domainCategoryId: payload.categoryId }
        });
      }
    }
    return tx.trackedDomain.findUniqueOrThrow({
      where: { id },
      include: { categoryAssignments: { include: { category: true } } }
    });
  });

  return NextResponse.json({ domain: updated });
}
