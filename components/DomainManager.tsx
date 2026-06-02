"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Ban, Play, Plus, RotateCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCompactNumber } from "@/lib/utils";

type Category = { id: string; name: string };
type DomainRow = {
  id: string;
  domain: string;
  displayName: string;
  notes: string;
  isActive: boolean;
  categoryId: string;
  latest?: { status: string; estimatedMonthlyVisits?: number | null } | null;
  warnings: string[];
};

export function DomainManager({ domains, categories }: { domains: DomainRow[]; categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function addDomain(formData: FormData) {
    setMessage("");
    const payload = {
      domain: String(formData.get("domain") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      categoryId: String(formData.get("categoryId") ?? "") || null,
      notes: String(formData.get("notes") ?? "")
    };
    const response = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setMessage(response.ok ? "Domain added." : "Could not add domain.");
    startTransition(() => router.refresh());
  }

  async function patchDomain(id: string, payload: Record<string, unknown>) {
    setMessage("");
    const response = await fetch(`/api/domains/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setMessage(response.ok ? "Domain updated." : "Could not update domain.");
    startTransition(() => router.refresh());
  }

  async function triggerScrape(id: string) {
    setMessage("");
    const response = await fetch(`/api/scrape/domain/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force: false })
    });
    setMessage(response.ok ? "Manual scrape completed." : "Manual scrape failed.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <form action={addDomain} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <Input name="domain" placeholder="example.com" required />
        <Input name="displayName" placeholder="Display name" />
        <select name="categoryId" className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          <option value="">Other</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
        <Textarea name="notes" placeholder="Notes" className="md:col-span-4" />
      </form>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>Website</span>
          <span>Category</span>
          <span>Latest Visits</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        {domains.map((domain) => (
          <div key={domain.id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
            <div>
              <a href={`/websites/${domain.id}`} className="font-medium hover:text-primary">
                {domain.displayName}
              </a>
              <div className="text-xs text-muted-foreground">{domain.domain}</div>
            </div>
            <select
              value={domain.categoryId}
              onChange={(event) => patchDomain(domain.id, { categoryId: event.target.value || null })}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="">Other</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span>{formatCompactNumber(domain.latest?.estimatedMonthlyVisits)}</span>
            <StatusBadge status={domain.latest?.status ?? "no_public_data"} />
            <div className="flex justify-end gap-2">
              <Button title="Trigger manual scrape" size="icon" variant="outline" onClick={() => triggerScrape(domain.id)} disabled={pending}>
                <Play className="h-4 w-4" />
              </Button>
              <Button
                title={domain.isActive ? "Disable domain" : "Enable domain"}
                size="icon"
                variant="outline"
                onClick={() => patchDomain(domain.id, { isActive: !domain.isActive })}
                disabled={pending}
              >
                {domain.isActive ? <Ban className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
              </Button>
            </div>
            <form
              className="col-span-5 grid gap-2 md:grid-cols-[1fr_1fr_auto]"
              action={(formData) =>
                patchDomain(domain.id, {
                  displayName: String(formData.get("displayName") ?? ""),
                  notes: String(formData.get("notes") ?? "")
                })
              }
            >
              <Input name="displayName" defaultValue={domain.displayName} />
              <Input name="notes" defaultValue={domain.notes} />
              <Button type="submit" variant="secondary" disabled={pending}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
