import { AlertManager } from "@/components/AlertManager";
import { getAlertsData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const data = await getAlertsData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Alerts</h1>
        <p className="text-sm text-muted-foreground">Configurable dashboard and Telegram alert rules.</p>
      </div>
      <AlertManager rules={data.rules} events={data.events} />
    </div>
  );
}
