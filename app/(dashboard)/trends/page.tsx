import { GoogleTrendsImportForm } from "@/components/ImportForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getTrendsData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const terms = await getTrendsData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Google Trends</h1>
        <p className="text-sm text-muted-foreground">Relative brand-search interest. These values are not website traffic.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manual CSV Import</CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleTrendsImportForm />
        </CardContent>
      </Card>
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Search Term</TH>
              <TH>Geo</TH>
              <TH>Latest Date</TH>
              <TH>Relative Interest</TH>
            </TR>
          </THead>
          <TBody>
            {terms.map((term: any) => {
              const latest = term.snapshots?.[0];
              return (
                <TR key={term.id}>
                  <TD className="font-medium">{term.term}</TD>
                  <TD>{latest?.geo ?? "worldwide"}</TD>
                  <TD>{latest?.date ? new Date(latest.date).toISOString().slice(0, 10) : "No data"}</TD>
                  <TD>{latest?.interest ?? "Unavailable"}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
