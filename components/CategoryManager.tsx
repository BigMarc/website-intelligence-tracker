"use client";

import type { FormEvent } from "react";
import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { assignments: number };
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isBusy = pending || saving;

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: String(formData.get("name") ?? "") })
      });
      const body = await response.json().catch(() => ({}));

      setMessage(response.ok ? "Category added." : body.error ?? "Could not add category.");
      if (response.ok) {
        formRef.current?.reset();
        startTransition(() => router.refresh());
      }
    } catch {
      setMessage("Could not add category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} onSubmit={addCategory} className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_auto]">
        <Input name="name" placeholder="New category name" maxLength={80} required />
        <Button type="submit" disabled={isBusy}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH>Assigned Domains</TH>
            </TR>
          </THead>
          <TBody>
            {categories.map((category) => (
              <TR key={category.id}>
                <TD className="font-medium">{category.name}</TD>
                <TD>{category.slug}</TD>
                <TD>{category._count?.assignments ?? 0}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
