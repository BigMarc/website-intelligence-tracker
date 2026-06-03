import { PrismaClient } from "@prisma/client";
import { getDisplayNameFromDomain, normalizeDomain } from "../lib/domains";
import { seededCategoryDomains } from "../lib/tracked-catalog";
import { toSlug } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  for (const { name: categoryName, domains } of seededCategoryDomains) {
    const category = await prisma.domainCategory.upsert({
      where: { slug: toSlug(categoryName) },
      create: { name: categoryName, slug: toSlug(categoryName) },
      update: { name: categoryName }
    });

    for (const input of domains) {
      const domain = normalizeDomain(input);
      const trackedDomain = await prisma.trackedDomain.upsert({
        where: { domain },
        create: {
          domain,
          displayName: getDisplayNameFromDomain(domain)
        },
        update: {}
      });

      await prisma.domainCategoryAssignment.deleteMany({
        where: { trackedDomainId: trackedDomain.id }
      });
      await prisma.domainCategoryAssignment.create({
        data: {
          trackedDomainId: trackedDomain.id,
          domainCategoryId: category.id
        }
      });
    }
  }

  await prisma.alertRule.upsert({
    where: { id: "seed-collector-blocked" },
    create: {
      id: "seed-collector-blocked",
      name: "Collector blocked",
      type: "collector_blocked",
      delivery: "dashboard"
    },
    update: {}
  });

  await prisma.alertRule.upsert({
    where: { id: "seed-parser-errors" },
    create: {
      id: "seed-parser-errors",
      name: "Parser errors detected",
      type: "parser_errors_detected",
      delivery: "dashboard"
    },
    update: {}
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
