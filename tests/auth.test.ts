import { describe, expect, it } from "vitest";
import { createSessionCookieValue, isProtectedPath, verifySessionCookieValue } from "@/lib/auth";

describe("authentication protection", () => {
  it("protects dashboard and mutation API routes while allowing health and login", () => {
    expect(isProtectedPath("/overview")).toBe(true);
    expect(isProtectedPath("/api/domains")).toBe(true);
    expect(isProtectedPath("/api/health")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("signs and verifies secure session cookies", async () => {
    const cookie = await createSessionCookieValue("admin", Date.UTC(2026, 5, 2));
    await expect(verifySessionCookieValue(cookie, Date.UTC(2026, 5, 2))).resolves.toMatchObject({ username: "admin" });
    await expect(verifySessionCookieValue(`${cookie}tampered`, Date.UTC(2026, 5, 2))).resolves.toBeNull();
  });
});
