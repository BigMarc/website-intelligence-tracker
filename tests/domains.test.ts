import { describe, expect, it } from "vitest";
import { normalizeDomain } from "@/lib/domains";

describe("normalizeDomain", () => {
  it("strips protocol, paths, query parameters, www, and casing", () => {
    expect(normalizeDomain("https://www.Example.COM/path?x=1")).toBe("example.com");
  });

  it("rejects malformed domains", () => {
    expect(() => normalizeDomain("not a domain")).toThrow();
    expect(() => normalizeDomain("https://localhost:3000")).toThrow();
  });
});
