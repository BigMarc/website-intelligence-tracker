import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, sessionCookieOptions, verifySessionCookieValue } from "@/lib/auth";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requirePageSession() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireApiSession(request: NextRequest) {
  const session = await verifySessionCookieValue(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }
  return { session, response: null };
}

export function clearSessionResponse() {
  const response = NextResponse.redirect(new URL("/login", "http://localhost"));
  response.cookies.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
