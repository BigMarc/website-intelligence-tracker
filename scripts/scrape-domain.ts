import { normalizeDomain, getDisplayNameFromDomain } from "../lib/domains";
import { hasDatabaseUrl } from "../lib/env";
import { prisma } from "../lib/prisma";
import { collectStandaloneDomain, scrapeOneTrackedDomain } from "../lib/scraper";

const args = process.argv.slice(2).filter((arg) => arg !== "--force");
const force = process.argv.includes("--force");
const domainInput = args[0];

if (!domainInput) {
  console.error("Usage: npm run scrape:domain -- example.com [--force]");
  process.exit(1);
}

const domain = normalizeDomain(domainInput);

async function main() {
  if (!hasDatabaseUrl()) {
    const result = await collectStandaloneDomain(domain);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const trackedDomain = await prisma.trackedDomain.upsert({
    where: { domain },
    create: { domain, displayName: getDisplayNameFromDomain(domain) },
    update: {}
  });
  const run = await scrapeOneTrackedDomain({ trackedDomainId: trackedDomain.id, force });
  console.log(JSON.stringify(run, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
