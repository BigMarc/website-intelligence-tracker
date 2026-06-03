import { describe, expect, it } from "vitest";
import { detectPublicPageAccess } from "@/lib/page-detection";

describe("public page access detection", () => {
  it("detects blocked pages", () => {
    expect(detectPublicPageAccess({ html: "Access Denied" }).status).toBe("blocked");
    expect(detectPublicPageAccess({ statusCode: 403 }).status).toBe("blocked");
  });

  it("detects AWS WAF challenge pages", () => {
    expect(
      detectPublicPageAccess({
        statusCode: 202,
        html: "<script>window.awsWafCookieDomainList=[]; window.gokuProps={}</script>"
      }).status
    ).toBe("blocked");
  });

  it("detects login walls and CAPTCHA pages", () => {
    expect(detectPublicPageAccess({ html: "Log in to continue" }).status).toBe("login_wall");
    expect(detectPublicPageAccess({ html: "Please verify you are human captcha" }).status).toBe("captcha");
  });
});
