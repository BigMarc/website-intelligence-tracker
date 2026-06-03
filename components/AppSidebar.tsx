import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Globe2,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Search,
  Settings,
  Tags
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { env } from "@/lib/env";

const nav = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/websites", label: "Tracked Websites", icon: Globe2 },
  { href: "/track", label: "Public Add Form", icon: PlusCircle },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/comparison", label: "Website Comparison", icon: BarChart3 },
  { href: "/trends", label: "Google Trends", icon: Search },
  { href: "/runs", label: "Scrape Runs", icon: ListChecks },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppSidebar() {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <Link href="/overview" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <span className="leading-tight">{env.appName}</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
