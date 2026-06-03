export const PUBLIC_TRACK_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS = 6;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function getClientIpFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function checkPublicTrackRateLimit(key: string, now = Date.now()) {
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + PUBLIC_TRACK_RATE_LIMIT_WINDOW_MS };
    buckets.set(key, bucket);
    return {
      allowed: true,
      remaining: PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS - 1,
      resetAt: bucket.resetAt
    };
  }

  if (existing.count >= PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS - existing.count,
    resetAt: existing.resetAt
  };
}

export function clearPublicTrackRateLimitForTests() {
  buckets.clear();
}

export function publicTrackRateLimitHeaders(input: { remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Limit": String(PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS),
    "X-RateLimit-Remaining": String(Math.max(0, input.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(input.resetAt / 1000))
  };
}
