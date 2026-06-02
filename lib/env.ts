const numberEnv = (key: string, fallback: number) => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const booleanEnv = (key: string, fallback: boolean) => {
  const raw = process.env[key];
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
};

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Website Intelligence Tracker",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  adminUsername: process.env.ADMIN_USERNAME ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  authSecret: process.env.AUTH_SECRET ?? "development-only-change-me",
  requestDelayMs: numberEnv("REQUEST_DELAY_MS", 8000),
  requestJitterMs: numberEnv("REQUEST_JITTER_MS", 3000),
  requestTimeoutMs: numberEnv("REQUEST_TIMEOUT_MS", 30000),
  maxRetries: numberEnv("MAX_RETRIES", 1),
  similarwebPublicEnabled: booleanEnv("SIMILARWEB_PUBLIC_ENABLED", true),
  similarwebApiEnabled: booleanEnv("SIMILARWEB_API_ENABLED", false),
  similarwebApiKey: process.env.SIMILARWEB_API_KEY ?? "",
  googleTrendsMode: process.env.GOOGLE_TRENDS_MODE ?? "disabled",
  telegramNotificationsEnabled: booleanEnv("TELEGRAM_NOTIFICATIONS_ENABLED", false),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? ""
};

export function hasDatabaseUrl() {
  return env.databaseUrl.trim().length > 0;
}

export function getPublicEnvStatus() {
  return {
    database: hasDatabaseUrl() ? "configured" : "missing",
    adminUsername: env.adminUsername ? "configured" : "missing",
    adminPassword: env.adminPassword ? "configured" : "missing",
    authSecret:
      env.authSecret && env.authSecret !== "development-only-change-me" ? "configured" : "development_fallback",
    similarwebPublic: env.similarwebPublicEnabled ? "enabled" : "disabled",
    similarwebApi: env.similarwebApiEnabled ? "enabled" : "disabled",
    googleTrendsMode: env.googleTrendsMode,
    telegram: env.telegramNotificationsEnabled ? "enabled" : "disabled"
  };
}
