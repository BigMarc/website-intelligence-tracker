import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { TrafficSparkline } from "@/components/MetricsCharts";
import { getOverviewData } from "@/lib/dashboard-data";
import { formatCompactNumber, formatNumber, formatPercent, titleize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getOverviewData();
  const cards = [
    ["Tracked websites", data.cards.trackedWebsites],
    ["Latest successful snapshots", data.cards.latestSuccessfulSnapshots],
    ["Domains with partial data", data.cards.partialData],
    ["Domains with no public data", data.cards.noPublicData],
    ["Domains requiring review", data.cards.reviewRequired],
    ["Latest scraper run", data.cards.latestRun?.status ? titleize(data.cards.latestRun.status) : "No runs"]
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Estimated external data, status coverage, and latest movement.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Website</TH>
              <TH>Category</TH>
              <TH>Estimated Monthly Visits</TH>
              <TH>Change vs Previous Snapshot</TH>
              <TH>Previous Snapshot</TH>
              <TH>Global Rank</TH>
              <TH>Leading Traffic Channel</TH>
              <TH>Data Status</TH>
              <TH>History</TH>
              <TH>Last Updated</TH>
            </TR>
          </THead>
          <TBody>
            {data.rows.map((row) => (
              <TR key={row.id}>
                <TD>
                  <Link href={`/websites/${row.id}`} className="font-medium hover:text-primary">
                    {row.displayName}
                  </Link>
                  <div className="text-xs text-muted-foreground">{row.domain}</div>
                </TD>
                <TD>{row.category}</TD>
                <TD>{formatCompactNumber(row.latest?.estimatedMonthlyVisits)}</TD>
                <TD>
                  <span className={row.percentageVisitChange && row.percentageVisitChange >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {row.percentageVisitChange !== null ? (
                      <span className="inline-flex items-center gap-1">
                        {row.percentageVisitChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {formatPercent(row.percentageVisitChange)}
                      </span>
                    ) : (
                      "Unavailable"
                    )}
                  </span>
                </TD>
                <TD>{formatNumber(row.previous?.estimatedMonthlyVisits)}</TD>
                <TD>{row.latest?.globalRank ? `#${formatNumber(row.latest.globalRank)}` : "Unavailable"}</TD>
                <TD>{row.leadingChannel ? `${titleize(row.leadingChannel.channel)} ${row.leadingChannel.sharePercent.toFixed(1)}%` : "Unavailable"}</TD>
                <TD>
                  <StatusBadge status={row.latest?.status ?? "no_public_data"} />
                </TD>
                <TD>
                  <TrafficSparkline data={row.history} />
                </TD>
                <TD>{row.latest?.collectedAt ? new Date(row.latest.collectedAt).toISOString().slice(0, 10) : "No data"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
