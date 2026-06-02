import { AppSidebar } from "@/components/AppSidebar";
import { requirePageSession } from "@/lib/auth-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requirePageSession();
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
