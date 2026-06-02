import { scrapeAllTrackedDomains } from "../lib/scraper";

const force = process.argv.includes("--force");

scrapeAllTrackedDomains({ force })
  .then((run) => {
    console.log(
      JSON.stringify(
        {
          runId: run.id,
          status: run.status,
          attempted: run.domainsAttempted,
          succeeded: run.domainsSucceeded,
          partial: run.domainsPartial,
          blocked: run.domainsBlocked,
          failed: run.domainsFailed
        },
        null,
        2
      )
    );
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
