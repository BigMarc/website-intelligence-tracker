"use client";

import { useTransition } from "react";
import { Filter } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { UNCATEGORIZED_CATEGORY_FILTER } from "@/lib/categories";

type Category = {
  id: string;
  name: string;
  _count?: { assignments: number };
};

export function OverviewCategoryFilter({
  categories,
  selectedCategoryId,
  totalRows,
  visibleRows
}: {
  categories: Category[];
  selectedCategoryId: string;
  totalRows: number;
  visibleRows: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setCategory(value: string) {
    const query = value ? `?category=${encodeURIComponent(value)}` : "";
    startTransition(() => router.push(`${pathname}${query}`));
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <label htmlFor="overview-category-filter">Category</label>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          id="overview-category-filter"
          value={selectedCategoryId}
          onChange={(event) => setCategory(event.target.value)}
          disabled={pending}
          className="h-9 min-w-56 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All categories</option>
          <option value={UNCATEGORIZED_CATEGORY_FILTER}>Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {typeof category._count?.assignments === "number" ? ` (${category._count.assignments})` : ""}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {visibleRows} / {totalRows} websites
        </span>
      </div>
    </section>
  );
}
