import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth-server";

const alertRuleSchema = z.object({
  name: z.string().min(2),
  type: z.enum([
    "traffic_increased_percent",
    "traffic_decreased_percent",
    "global_rank_improved_positions",
    "global_rank_declined_positions",
    "no_public_data_consecutive_runs",
    "collector_blocked",
    "parser_errors_detected"
  ]),
  trackedDomainId: z.string().optional().nullable(),
  thresholdFloat: z.number().optional().nullable(),
  thresholdInt: z.number().int().optional().nullable(),
  consecutiveRuns: z.number().int().optional().nullable(),
  delivery: z.enum(["dashboard", "telegram"]).default("dashboard")
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const rules = await prisma.alertRule.findMany({ orderBy: { createdAt: "desc" }, include: { trackedDomain: true } });
  const events = await prisma.alertEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { trackedDomain: true, alertRule: true }
  });
  return NextResponse.json({ rules, events });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;
  const payload = alertRuleSchema.parse(await request.json());
  const rule = await prisma.alertRule.create({ data: payload });
  return NextResponse.json({ rule }, { status: 201 });
}
