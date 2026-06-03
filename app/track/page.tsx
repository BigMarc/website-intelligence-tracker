import Link from "next/link";
import { Activity, DatabaseZap, LockKeyhole, LogIn, Radar, RefreshCw } from "lucide-react";
import { PublicTrackDomainForm } from "@/components/PublicTrackDomainForm";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const statusItems = [
  { label: "Public Similarweb", icon: Radar },
  { label: "Immediate scrape", icon: DatabaseZap },
  { label: "Weekly tracker", icon: RefreshCw },
  { label: "Dashboard locked", icon: LockKeyhole }
];

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/track" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <span className="truncate">{env.appName}</span>
          </Link>
          <Button asChild variant="outline">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Add a Website</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Public submissions add active domains, run one Similarweb public scrape, and leave dashboard data behind the admin login.
            </p>
          </div>
          <PublicTrackDomainForm />
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
            <div className="text-sm font-semibold">Tracker Status</div>
            <div className="mt-4 space-y-3">
              {statusItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
            <div className="text-sm font-semibold">Collector Rules</div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Only public page values are stored.</p>
              <p>Login walls, CAPTCHA, blocks, and missing values are recorded as statuses.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
