export const UNCATEGORIZED_CATEGORY_FILTER = "uncategorized";

export function normalizeCategoryName(input: string) {
  return input.trim().replace(/\s+/g, " ");
}
