import { collectStandaloneDomain } from "../lib/scraper";
import { seededCategoryDomains } from "../lib/tracked-catalog";
import { normalizeDomain } from "../lib/domains";

function parseNumberArg(name: string, fallback: number) {
  const arg = process.argv.find((value) => value.startsWith(`${name}=`));
  if (!arg) return fallback;
  const value = Number(arg.slice(name.length + 1));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function uniqueTrackedDomains() {
  return [...new Set(seededCategoryDomains.flatMap((group) => group.domains).map(normalizeDomain))].sort();
}

function selectedDomains() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--delay-ms=") && !arg.startsWith("--limit="));
  if (args.length > 0) return args.map(normalizeDomain);
  return uniqueTrackedDomains().slice(0, parseNumberArg("--limit", 5));
}

async function sleep(ms: number) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const delayMs = parseNumberArg("--delay-ms", 30_000);
  const domains = selectedDomains();
  const results = [];

  for (const [index, domain] of domains.entries()) {
    if (index > 0) await sleep(delayMs);
    const result = await collectStandaloneDomain(domain);
    const visits = result.metrics.estimatedMonthlyVisits ?? null;
    const success = result.status === "success" && typeof visits === "number" && visits > 0;
    const row = {
      domain,
      success,
      status: result.status,
      parserVersion: result.parserVersion,
      visits,
      globalRank: result.metrics.globalRank ?? null,
      channels: result.trafficChannels?.length ?? 0,
      countries: result.topCountries?.length ?? 0,
      warnings: result.warnings
    };
    results.push(row);
    console.log(JSON.stringify(row));
  }

  const successful = results.filter((result) => result.success);
  const failed = results.filter((result) => !result.success);
  console.log(JSON.stringify({ total: results.length, successful: successful.length, failed: failed.length, failedDomains: failed.map((result) => result.domain) }));
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
