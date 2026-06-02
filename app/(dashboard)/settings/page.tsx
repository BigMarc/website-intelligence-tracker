import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { getSettingsData } from "@/lib/dashboard-data";
import { titleize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = await getSettingsData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Railway service commands, provider state, and runtime configuration.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Web Service</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm">{data.webCommand}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cron Worker</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm">{data.cronCommand}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cron Schedule</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm">{data.cronSchedule}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Similarweb Public</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={data.providerHealth.status} />
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {Object.entries(data.envStatus).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-b-0">
                <span className="font-mono">{key}</span>
                <span>{titleize(String(value))}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Collector Request Config</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {Object.entries(data.requestConfig).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-b-0">
                <span>{key}</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
            <div className="pt-4 text-muted-foreground">{data.googleTrends}</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
