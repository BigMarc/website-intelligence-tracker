import { StatusBadge } from "@/components/StatusBadge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getRunDetailData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await getRunDetailData(id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Scrape Run</h1>
        <p className="text-sm text-muted-foreground">{new Date(run.startedAt).toISOString()}</p>
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Domain</TH>
              <TH>Status</TH>
              <TH>Duration</TH>
              <TH>Error</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {run.items.map((item: any) => (
              <TR key={item.id}>
                <TD className="font-medium">{item.trackedDomain.domain}</TD>
                <TD>
                  <StatusBadge status={item.status} />
                </TD>
                <TD>{item.durationMs}ms</TD>
                <TD>{item.errorMessage ?? ""}</TD>
                <TD>{new Date(item.createdAt).toISOString()}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
