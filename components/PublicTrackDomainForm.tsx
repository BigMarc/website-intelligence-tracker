"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Plus, RotateCw } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCompactNumber, formatDuration, formatNumber, titleize } from "@/lib/utils";

type PublicTrackResponse = {
  domain: {
    id: string;
    domain: string;
    displayName: string;
    isActive: boolean;
    created: boolean;
  };
  weeklyTracker: {
    included: boolean;
    schedule: string;
  };
  run: {
    id: string;
    status: string;
    itemStatus: string | null;
    itemError: string | null;
    durationMs: number | null;
  };
  snapshot: {
    id: string;
    provider: string;
    status: string;
    collectedAt: string;
    sourceUrl: string;
    parserVersion: string;
    warnings: string[];
    metrics: {
      estimatedMonthlyVisits: number | null;
      globalRank: number | null;
      countryRank: number | null;
      categoryRank: number | null;
      bounceRate: number | null;
      pagesPerVisit: number | null;
      averageVisitDurationSeconds: number | null;
    };
    trafficChannels: Array<{ channel: string; sharePercent: number }>;
    topCountries: Array<{ countryCode: string | null; countryName: string; sharePercent: number | null }>;
  } | null;
};

function formatRank(value: number | null | undefined) {
  if (!value) return "Unavailable";
  return `#${formatNumber(value)}`;
}

function formatMetricPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "Unavailable";
  return `${value.toFixed(2)}%`;
}

export function PublicTrackDomainForm() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<PublicTrackResponse | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const collectedLabel = useMemo(() => {
    if (!result?.snapshot?.collectedAt) return "Not collected";
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(result.snapshot.collectedAt));
  }, [result?.snapshot?.collectedAt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/public/track-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error ?? "Could not add and scrape this domain.");
        return;
      }

      setResult(payload);
    } catch {
      setError("Network error while adding this domain.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-panel">
      <form onSubmit={submit} className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="example.com"
            required
            aria-label="Domain"
            className="h-11 min-w-0 flex-1 text-base"
          />
          <Button type="submit" disabled={pending} className="h-11 sm:w-44">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {pending ? "Scraping" : "Add Domain"}
          </Button>
        </div>
        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </form>

      {result ? (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-xl font-semibold">{result.domain.displayName}</h2>
                <Badge tone={result.domain.created ? "blue" : "neutral"}>
                  {result.domain.created ? "New" : "Updated"}
                </Badge>
                <StatusBadge status={result.snapshot?.status ?? result.run.itemStatus ?? result.run.status} />
              </div>
              <p className="mt-1 break-all text-sm text-muted-foreground">{result.domain.domain}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {result.weeklyTracker.included ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <RotateCw className="h-4 w-4" />}
              <span>Weekly tracker active</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs font-medium text-muted-foreground">Monthly Visits</div>
              <div className="mt-1 text-lg font-semibold">{formatCompactNumber(result.snapshot?.metrics.estimatedMonthlyVisits)}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs font-medium text-muted-foreground">Global Rank</div>
              <div className="mt-1 text-lg font-semibold">{formatRank(result.snapshot?.metrics.globalRank)}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs font-medium text-muted-foreground">Bounce Rate</div>
              <div className="mt-1 text-lg font-semibold">{formatMetricPercent(result.snapshot?.metrics.bounceRate)}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs font-medium text-muted-foreground">Visit Duration</div>
              <div className="mt-1 text-lg font-semibold">
                {formatDuration(result.snapshot?.metrics.averageVisitDurationSeconds)}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-3 text-sm font-medium">Traffic Channels</div>
              <div className="space-y-2">
                {result.snapshot?.trafficChannels.length ? (
                  result.snapshot.trafficChannels.map((channel) => (
                    <div key={channel.channel} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                      <span>{titleize(channel.channel)}</span>
                      <span className="font-medium">{channel.sharePercent.toFixed(1)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                )}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-3 text-sm font-medium">Top Countries</div>
              <div className="space-y-2">
                {result.snapshot?.topCountries.length ? (
                  result.snapshot.topCountries.map((country) => (
                    <div key={`${country.countryCode}-${country.countryName}`} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                      <span>{country.countryName}</span>
                      <span className="font-medium">
                        {country.sharePercent === null || country.sharePercent === undefined
                          ? "Unavailable"
                          : `${country.sharePercent.toFixed(1)}%`}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                )}
              </div>
            </div>
          </div>

          {result.snapshot?.warnings.length ? (
            <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <div className="mb-2 font-medium">Warnings</div>
              <ul className="space-y-1">
                {result.snapshot.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Collected {collectedLabel}</span>
            {result.snapshot?.sourceUrl ? (
              <a
                href={result.snapshot.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-foreground hover:text-primary"
              >
                Similarweb source
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
