import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCategoriesData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategoriesData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground">Domain grouping for market segments and comparisons.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Domain Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Slug</TH>
                <TH>Assigned Domains</TH>
              </TR>
            </THead>
            <TBody>
              {categories.map((category: any) => (
                <TR key={category.id}>
                  <TD className="font-medium">{category.name}</TD>
                  <TD>{category.slug}</TD>
                  <TD>{category._count?.assignments ?? 0}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
