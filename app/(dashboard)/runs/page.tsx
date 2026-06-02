import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getRunsData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const runs = await getRunsData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Scrape Runs</h1>
        <p className="text-sm text-muted-foreground">Run timestamps, duration, counts, and per-domain logs.</p>
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Run Timestamp</TH>
              <TH>Status</TH>
              <TH>Duration</TH>
              <TH>Attempted</TH>
              <TH>Successful</TH>
              <TH>Partial</TH>
              <TH>Blocked</TH>
              <TH>Failed</TH>
            </TR>
          </THead>
          <TBody>
            {runs.map((run: any) => {
              const duration = run.finishedAt ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime() : null;
              return (
                <TR key={run.id}>
                  <TD>
                    <Link href={`/runs/${run.id}`} className="font-medium hover:text-primary">
                      {new Date(run.startedAt).toISOString()}
                    </Link>
                  </TD>
                  <TD>
                    <StatusBadge status={run.status} />
                  </TD>
                  <TD>{duration === null ? "Running" : `${Math.round(duration / 1000)}s`}</TD>
                  <TD>{run.domainsAttempted}</TD>
                  <TD>{run.domainsSucceeded}</TD>
                  <TD>{run.domainsPartial}</TD>
                  <TD>{run.domainsBlocked}</TD>
                  <TD>{run.domainsFailed}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
