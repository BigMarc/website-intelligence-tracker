import { ChannelBarChart, RankHistoryChart, TrafficHistoryChart } from "@/components/MetricsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getDomainDetailData } from "@/lib/dashboard-data";
import { formatCompactNumber, formatDuration, formatNumber, formatPercent, titleize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const domain = await getDomainDetailData(id);
  const latest = domain.snapshots[0];
  const latestChannels = latest?.trafficChannelSnapshots ?? [];
  const latestCountries = latest?.countrySnapshots ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{domain.displayName}</h1>
          <p className="text-sm text-muted-foreground">{domain.domain}</p>
        </div>
        <StatusBadge status={latest?.status ?? "no_public_data"} />
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Estimated Visits</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCompactNumber(latest?.estimatedMonthlyVisits)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Growth</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatPercent(domain.percentageVisitChange)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Global Rank</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{latest?.globalRank ? `#${formatNumber(latest.globalRank)}` : "Unavailable"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visit Duration</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatDuration(latest?.averageVisitDurationSeconds)}</CardContent>
        </Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estimated Monthly Visits Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficHistoryChart data={domain.history} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rank History</CardTitle>
          </CardHeader>
          <CardContent>
            <RankHistoryChart data={domain.history} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Traffic-Channel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelBarChart data={latestChannels.map((item: any) => ({ channel: titleize(item.channel), sharePercent: item.sharePercent }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Country</TH>
                  <TH>Share</TH>
                </TR>
              </THead>
              <TBody>
                {latestCountries.map((country: any) => (
                  <TR key={`${country.countryName}-${country.countryCode ?? ""}`}>
                    <TD>{country.countryName}</TD>
                    <TD>{country.sharePercent === null ? "Unavailable" : `${country.sharePercent.toFixed(1)}%`}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(latest?.warnings ?? domain.warnings).map((warning: string) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Raw Normalized JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(latest?.rawJson ?? latest ?? {}, null, 2)}</pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
