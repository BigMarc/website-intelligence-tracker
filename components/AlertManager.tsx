"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { titleize } from "@/lib/utils";

const alertTypes = [
  "traffic_increased_percent",
  "traffic_decreased_percent",
  "global_rank_improved_positions",
  "global_rank_declined_positions",
  "no_public_data_consecutive_runs",
  "collector_blocked",
  "parser_errors_detected"
];

export function AlertManager({ rules, events }: { rules: any[]; events: any[] }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function addRule(formData: FormData) {
    const payload = {
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "collector_blocked"),
      thresholdFloat: formData.get("thresholdFloat") ? Number(formData.get("thresholdFloat")) : null,
      thresholdInt: formData.get("thresholdInt") ? Number(formData.get("thresholdInt")) : null,
      consecutiveRuns: formData.get("consecutiveRuns") ? Number(formData.get("consecutiveRuns")) : null,
      delivery: String(formData.get("delivery") ?? "dashboard")
    };
    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setMessage(response.ok ? "Alert rule added." : "Could not add alert rule.");
    startTransition(() => router.refresh());
  }

  async function toggleRule(id: string, isActive: boolean) {
    const response = await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive })
    });
    setMessage(response.ok ? "Alert rule updated." : "Could not update alert rule.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <form action={addRule} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr_auto]">
        <Input name="name" placeholder="Rule name" required />
        <select name="type" className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          {alertTypes.map((type) => (
            <option key={type} value={type}>
              {titleize(type)}
            </option>
          ))}
        </select>
        <Input name="thresholdFloat" type="number" step="0.1" placeholder="% threshold" />
        <Input name="thresholdInt" type="number" placeholder="Rank steps" />
        <Input name="consecutiveRuns" type="number" placeholder="Runs" />
        <select name="delivery" className="h-9 rounded-md border border-border bg-background px-3 text-sm">
          <option value="dashboard">Dashboard</option>
          <option value="telegram">Telegram</option>
        </select>
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Rules</div>
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <div>
                <div className="font-medium">{rule.name}</div>
                <div className="text-xs text-muted-foreground">{titleize(rule.type)}</div>
              </div>
              <Button size="icon" variant="outline" title="Toggle rule" onClick={() => toggleRule(rule.id, !rule.isActive)}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </section>
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Events</div>
          {events.map((event) => (
            <div key={event.id} className="space-y-2 border-b border-border px-4 py-3 last:border-b-0">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{event.trackedDomain?.domain ?? titleize(event.type)}</span>
                <StatusBadge status={event.status} />
              </div>
              <p className="text-sm text-muted-foreground">{event.message}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
