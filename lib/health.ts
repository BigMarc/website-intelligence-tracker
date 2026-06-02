import { prisma } from "@/lib/prisma";

export type HealthResult = {
  status: "ok" | "degraded";
  database: "connected" | "not_configured" | "error";
  timestamp: string;
  message?: string;
};

export async function getHealthStatus(client: Pick<typeof prisma, "$queryRaw"> = prisma): Promise<HealthResult> {
  const timestamp = new Date().toISOString();
  if (!process.env.DATABASE_URL) {
    return { status: "degraded", database: "not_configured", timestamp, message: "DATABASE_URL is not configured." };
  }

  try {
    await client.$queryRaw`SELECT 1`;
    return { status: "ok", database: "connected", timestamp };
  } catch (error) {
    return {
      status: "degraded",
      database: "error",
      timestamp,
      message: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}
