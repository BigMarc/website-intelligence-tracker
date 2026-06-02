import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(_request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", env.appBaseUrl), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
