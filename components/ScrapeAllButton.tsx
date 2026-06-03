"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ScrapeRunResponse = {
  run?: {
    id: string;
    domainsAttempted: number;
    domainsSucceeded: number;
    domainsPartial: number;
    domainsBlocked: number;
    domainsFailed: number;
  };
  error?: string;
};

export function ScrapeAllButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [runId, setRunId] = useState("");
  const isBusy = pending || running;

  async function scrapeAll() {
    setMessage("");
    setRunId("");
    setRunning(true);

    try {
      const response = await fetch("/api/scrape/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true })
      });
      const body = (await response.json().catch(() => ({}))) as ScrapeRunResponse;

      if (!response.ok || !body.run) {
        setMessage(body.error ?? "Manual scrape failed.");
        return;
      }

      setRunId(body.run.id);
      setMessage(
        `Manual scrape completed: ${body.run.domainsAttempted} attempted, ${body.run.domainsSucceeded} successful, ${body.run.domainsPartial} partial, ${body.run.domainsBlocked} blocked, ${body.run.domainsFailed} failed.`
      );
      startTransition(() => router.refresh());
    } catch {
      setMessage("Manual scrape failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold">Manual scrape</h2>
        {message ? (
          <p className="text-sm text-muted-foreground">
            {message}{" "}
            {runId ? (
              <Link href={`/runs/${runId}`} className="font-medium text-primary hover:underline">
                View run
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
      <Button type="button" onClick={scrapeAll} disabled={isBusy}>
        <RotateCw className={isBusy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        {running ? "Scraping..." : "Scrape all now"}
      </Button>
    </section>
  );
}
