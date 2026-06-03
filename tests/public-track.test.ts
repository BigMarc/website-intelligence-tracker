import { beforeEach, describe, expect, it } from "vitest";
import {
  PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS,
  checkPublicTrackRateLimit,
  clearPublicTrackRateLimitForTests,
  getClientIpFromHeaders,
  publicTrackRateLimitHeaders
} from "@/lib/public-track";

describe("public domain tracking helpers", () => {
  beforeEach(() => {
    clearPublicTrackRateLimitForTests();
  });

  it("extracts a stable client ip from forwarded headers", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 198.51.100.7"
    });
    expect(getClientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("limits repeated public submissions per key", () => {
    const now = Date.UTC(2026, 5, 3);
    for (let index = 0; index < PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS; index += 1) {
      expect(checkPublicTrackRateLimit("203.0.113.10", now).allowed).toBe(true);
    }
    const blocked = checkPublicTrackRateLimit("203.0.113.10", now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("formats rate limit headers for API responses", () => {
    expect(publicTrackRateLimitHeaders({ remaining: 3, resetAt: 1780483800000 })).toMatchObject({
      "X-RateLimit-Limit": String(PUBLIC_TRACK_RATE_LIMIT_MAX_ATTEMPTS),
      "X-RateLimit-Remaining": "3",
      "X-RateLimit-Reset": "1780483800"
    });
  });
});
