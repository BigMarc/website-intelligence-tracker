import { normalizeDomain } from "@/lib/domains";
import { parseDurationToSeconds, parseMetricNumber, parsePercent, parseRank } from "@/lib/metrics";

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) =>
    headers.reduce<CsvRow>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {})
  );
}

export function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function rowsToCsv(rows: Array<Record<string, unknown>>, headers: string[]) {
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
}

export function parseSnapshotCsvRows(text: string) {
  return parseCsv(text).map((row) => ({
    domain: normalizeDomain(row.domain ?? ""),
    collectedAt: row.collectedAt ? new Date(row.collectedAt) : new Date(),
    provider: row.provider || "manual-csv",
    sourceUrl: row.sourceUrl || "manual-csv://import",
    metrics: {
      estimatedMonthlyVisits: parseMetricNumber(row.estimatedMonthlyVisits),
      globalRank: parseRank(row.globalRank),
      countryRank: parseRank(row.countryRank),
      categoryRank: parseRank(row.categoryRank),
      bounceRate: parsePercent(row.bounceRate),
      pagesPerVisit: parseMetricNumber(row.pagesPerVisit),
      averageVisitDurationSeconds: parseDurationToSeconds(row.averageVisitDurationSeconds)
    }
  }));
}

export function parseGoogleTrendsCsvRows(text: string) {
  return parseCsv(text).map((row) => ({
    term: (row.term || row.searchTerm || "").trim(),
    geo: (row.geo || row.country || "worldwide").trim() || "worldwide",
    date: new Date(row.date),
    interest: Number(row.interest)
  }));
}
