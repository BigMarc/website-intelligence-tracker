import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/auth-server";
import { normalizeCategoryName } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/utils";

const createCategorySchema = z.object({
  name: z.string().min(1).max(80)
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const categories = await prisma.domainCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assignments: true } } }
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const payload = createCategorySchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }

  const name = normalizeCategoryName(payload.data.name);
  const slug = toSlug(name);

  if (!slug) {
    return NextResponse.json({ error: "Category name must include letters or numbers." }, { status: 400 });
  }

  try {
    const category = await prisma.domainCategory.create({
      data: { name, slug },
      include: { _count: { select: { assignments: true } } }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A category with that name or slug already exists." }, { status: 409 });
    }

    throw error;
  }
}
