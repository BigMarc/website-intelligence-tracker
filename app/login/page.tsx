import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/lib/env";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-panel">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold">{env.appName}</h1>
            <p className="text-sm text-muted-foreground">Admin dashboard</p>
          </div>
        </div>
        <form action="/api/auth/login" method="post" className="space-y-3">
          <input type="hidden" name="next" value={params.next ?? "/overview"} />
          <Input name="username" placeholder="Username" autoComplete="username" required />
          <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
          {params.error ? <p className="text-sm text-rose-600 dark:text-rose-300">{params.error}</p> : null}
          {!env.adminUsername || !env.adminPassword ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">ADMIN_USERNAME and ADMIN_PASSWORD are not configured.</p>
          ) : null}
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
}
