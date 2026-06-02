import { Badge } from "@/components/ui/badge";
import { titleize } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "success" || status === "ok"
      ? "green"
      : status === "partial" || status === "no_public_data" || status === "running"
        ? "amber"
        : status === "blocked" || status === "captcha" || status === "login_wall" || status === "failed"
          ? "red"
          : "neutral";

  return <Badge tone={tone}>{titleize(status)}</Badge>;
}
