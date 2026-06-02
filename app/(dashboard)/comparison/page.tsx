import { ComparisonChart } from "@/components/MetricsCharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getComparisonData } from "@/lib/dashboard-data";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ComparisonPage({
  searchParams
}: {
  searchParams: Promise<{ domains?: string | string[] }>;
}) {
  const params = await searchParams;
  const selectedIds = Array.isArray(params.domains)
    ? params.domains
    : typeof params.domains === "string"
      ? params.domains.split(",").filter(Boolean)
      : [];
  const data = await getComparisonData(selectedIds);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Website Comparison</h1>
        <p className="text-sm text-muted-foreground">Estimated external data, relative search interest, and publicly unavailable values.</p>
      </div>
      <form className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {data.domains.map((domain) => (
            <label key={domain.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="domains" value={domain.id} defaultChecked={data.selected.some((item) => item.id === domain.id)} />
              <span>{domain.domain}</span>
            </label>
          ))}
        </div>
        <Button type="submit" className="mt-4">
          Compare
        </Button>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>Estimated Monthly Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonChart data={data.chartData} keys={data.selected.map((domain) => domain.domain)} />
        </CardContent>
      </Card>
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Website</TH>
              <TH>Estimated Monthly Visits</TH>
              <TH>Growth Rate</TH>
              <TH>Global Rank</TH>
              <TH>Traffic-Channel Mix</TH>
              <TH>Google Trends Search Interest</TH>
            </TR>
          </THead>
          <TBody>
            {data.selected.map((domain) => (
              <TR key={domain.id}>
                <TD className="font-medium">{domain.domain}</TD>
                <TD>{formatCompactNumber(domain.latest?.estimatedMonthlyVisits)}</TD>
                <TD>{formatPercent(domain.percentageVisitChange)}</TD>
                <TD>{domain.latest?.globalRank ? `#${domain.latest.globalRank}` : "Publicly unavailable"}</TD>
                <TD>{domain.leadingChannel ? `${domain.leadingChannel.channel} ${domain.leadingChannel.sharePercent.toFixed(1)}%` : "Publicly unavailable"}</TD>
                <TD>Relative search interest</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
