import type { ProviderSnapshotResult } from "@/providers/types";

export const MANUAL_CSV_PROVIDER = "manual-csv";

export type ManualSnapshotInput = {
  domain: string;
  collectedAt: Date;
  metrics: ProviderSnapshotResult["metrics"];
};
