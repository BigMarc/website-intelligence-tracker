import { PrismaClient } from "@prisma/client";
import { getDisplayNameFromDomain } from "../lib/domains";
import { toSlug } from "../lib/utils";

const prisma = new PrismaClient();

const categoryDomains = {
  "Creator Monetization Platforms": ["onlyfans.com", "fansly.com", "fanvue.com"],
  "Link-in-Bio Platforms": [
    "linktr.ee",
    "allmylinks.com",
    "beacons.ai",
    "hoo.be",
    "link.me",
    "juicy.bio",
    "bink.bio"
  ],
  "Social Platforms": ["instagram.com", "tiktok.com", "reddit.com", "x.com", "youtube.com"],
  "Competitor Agencies": [],
  Other: []
};

async function main() {
  for (const [categoryName, domains] of Object.entries(categoryDomains)) {
    const category = await prisma.domainCategory.upsert({
      where: { slug: toSlug(categoryName) },
      create: { name: categoryName, slug: toSlug(categoryName) },
      update: { name: categoryName }
    });

    for (const domain of domains) {
      const trackedDomain = await prisma.trackedDomain.upsert({
        where: { domain },
        create: {
          domain,
          displayName: getDisplayNameFromDomain(domain)
        },
        update: {}
      });

      await prisma.domainCategoryAssignment.upsert({
        where: {
          trackedDomainId_domainCategoryId: {
            trackedDomainId: trackedDomain.id,
            domainCategoryId: category.id
          }
        },
        create: {
          trackedDomainId: trackedDomain.id,
          domainCategoryId: category.id
        },
        update: {}
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
