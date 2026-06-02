import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionCookieValue,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyAdminCredentials
} from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return current.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else current.count += 1;
}

export async function POST(request: NextRequest) {
  const key = clientKey(request);
  const form = await request.formData();
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/overview");

  if (isRateLimited(key)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "Too many attempts. Try again later.");
    return NextResponse.redirect(url, { status: 303 });
  }

  if (!verifyAdminCredentials(username, password)) {
    recordFailedAttempt(key);
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "Invalid credentials.");
    return NextResponse.redirect(url, { status: 303 });
  }

  attempts.delete(key);
  const response = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/overview", request.url), {
    status: 303
  });
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionCookieValue(username), sessionCookieOptions());
  return response;
}
