import { afterEach, describe, expect, it } from "vitest";
import { getHealthStatus } from "@/lib/health";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("health endpoint response", () => {
  it("reports connected database when the query succeeds", async () => {
    process.env.DATABASE_URL = "postgresql://example";
    const health = await getHealthStatus({
      $queryRaw: async () => 1
    } as any);
    expect(health.status).toBe("ok");
    expect(health.database).toBe("connected");
  });

  it("reports missing database configuration", async () => {
    delete process.env.DATABASE_URL;
    const health = await getHealthStatus({
      $queryRaw: async () => 1
    } as any);
    expect(health.status).toBe("degraded");
    expect(health.database).toBe("not_configured");
  });
});
