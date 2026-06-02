import { env } from "@/lib/env";

export const SESSION_COOKIE_NAME = "wit_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  username: string;
  exp: number;
  nonce: string;
};

function base64UrlEncode(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(input: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function createSessionCookieValue(username: string, now = Date.now()) {
  const payload: SessionPayload = {
    username,
    exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
    nonce: randomNonce()
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload, env.authSecret);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionCookieValue(value: string | undefined | null, now = Date.now()) {
  if (!value) return null;
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;
  const expected = await sign(encodedPayload, env.authSecret);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.username || payload.exp < Math.floor(now / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  if (!env.adminUsername || !env.adminPassword) return false;
  return username === env.adminUsername && password === env.adminPassword;
}

export function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  );
}

export function isProtectedPath(pathname: string) {
  if (isPublicPath(pathname)) return false;
  if (pathname.startsWith("/api/")) return true;
  return true;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
}
