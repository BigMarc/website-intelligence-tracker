import type { ProviderSnapshotStatus } from "@/providers/types";

const captchaPatterns = [/captcha/i, /verify you are human/i, /human verification/i, /recaptcha/i, /hcaptcha/i];
const loginPatterns = [/log in to continue/i, /sign in to continue/i, /login required/i, /create an account/i];
const blockedPatterns = [
  /access denied/i,
  /request blocked/i,
  /temporarily unavailable/i,
  /too many requests/i,
  /forbidden/i
];

export function detectPublicPageAccess(input: { html?: string; statusCode?: number; url?: string }): {
  status: ProviderSnapshotStatus | null;
  reason: string | null;
} {
  const html = input.html ?? "";
  if (input.statusCode === 401 || input.statusCode === 403) {
    return { status: "blocked", reason: `HTTP ${input.statusCode}` };
  }
  if (input.statusCode === 429) return { status: "blocked", reason: "HTTP 429 rate limited" };

  if (captchaPatterns.some((pattern) => pattern.test(html))) {
    return { status: "captcha", reason: "CAPTCHA or human verification detected" };
  }

  if (loginPatterns.some((pattern) => pattern.test(html))) {
    return { status: "login_wall", reason: "Login wall detected" };
  }

  if (blockedPatterns.some((pattern) => pattern.test(html))) {
    return { status: "blocked", reason: "Blocked or access-denied page detected" };
  }

  return { status: null, reason: null };
}
