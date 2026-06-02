import { DomainManager } from "@/components/DomainManager";
import { SnapshotImportForm } from "@/components/ImportForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDomainsPageData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function WebsitesPage() {
  const data = await getDomainsPageData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tracked Websites</h1>
        <p className="text-sm text-muted-foreground">Domains, categories, manual scrapes, warnings, and CSV snapshot movement.</p>
      </div>
      <DomainManager domains={data.domains} categories={data.categories} />
      <Card>
        <CardHeader>
          <CardTitle>Snapshot CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <SnapshotImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
