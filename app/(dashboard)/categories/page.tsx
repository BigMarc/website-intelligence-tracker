import { CategoryManager } from "@/components/CategoryManager";
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
      <CategoryManager categories={categories} />
    </div>
  );
}
