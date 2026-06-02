"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const snapshotExample =
  "domain,collectedAt,estimatedMonthlyVisits,globalRank,bounceRate,pagesPerVisit,averageVisitDurationSeconds\nexample.com,2026-06-02,1.2M,#1245,54.22%,3.4,00:03:41";
const trendsExample = "term,geo,date,interest\nOnlyFans,US,2026-06-02,72\nFansly,US,2026-06-02,18";

export function SnapshotImportForm() {
  const [text, setText] = useState(snapshotExample);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function submit() {
    const response = await fetch("/api/import/snapshots", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `Imported ${data.imported ?? 0} snapshots.` : "Import failed.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <Textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-36 font-mono text-xs" />
      <div className="flex gap-2">
        <Button type="button" onClick={submit} disabled={pending}>
          <Upload className="h-4 w-4" />
          Import Snapshots
        </Button>
        <Button asChild variant="outline">
          <a href="/api/export/snapshots">
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

export function GoogleTrendsImportForm() {
  const [text, setText] = useState(trendsExample);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function submit() {
    const response = await fetch("/api/import/google-trends", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `Imported ${data.imported ?? 0} interest snapshots.` : "Import failed.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <Textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-36 font-mono text-xs" />
      <Button type="button" onClick={submit} disabled={pending}>
        <Upload className="h-4 w-4" />
        Import Trends
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
