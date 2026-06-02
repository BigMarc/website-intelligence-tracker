type ScrapeLogInput = {
  runId?: string;
  domain?: string;
  provider?: string;
  status?: string;
  durationMs?: number;
  attempt?: number;
  parserVersion?: string;
  metricsFound?: number;
  warnings?: string[];
  message?: string;
};

const redactedKeys = /password|token|secret|cookie|database_url|api_key/i;

export function structuredLog(input: ScrapeLogInput) {
  const safe = Object.fromEntries(
    Object.entries(input).filter(([key, value]) => !redactedKeys.test(key) && value !== undefined)
  );
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), ...safe }));
}
