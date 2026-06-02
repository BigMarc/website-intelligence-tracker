import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth-server";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(["open", "sent", "resolved"]).optional()
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const payload = patchSchema.parse(await request.json());
  if (payload.status) {
    const event = await prisma.alertEvent.update({ where: { id }, data: { status: payload.status } });
    return NextResponse.json({ event });
  }
  const rule = await prisma.alertRule.update({ where: { id }, data: { isActive: payload.isActive } });
  return NextResponse.json({ rule });
}
