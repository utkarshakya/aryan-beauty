import { describe, expect, it } from "vitest";
import {
  AUTH_REDIRECT_PATH,
  DEFAULT_RETURN_PATH,
  authFallbackRedirectUrl,
  sanitizeReturnTo,
} from "@/lib/auth/redirect";

describe("sanitizeReturnTo", () => {
  it.each([
    ["/appointments"],
    ["/appointments?serviceId=3"],
    ["/services#nails"],
  ])("keeps the local path %s", (path) => {
    expect(sanitizeReturnTo(path)).toBe(path);
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeReturnTo("  /appointments?serviceId=3  ")).toBe(
      "/appointments?serviceId=3",
    );
  });

  it.each([
    ["a protocol-relative URL", "//evil.example.com"],
    ["a backslash protocol-relative URL", "/\\evil.example.com"],
    ["an absolute URL", "https://evil.example.com"],
    ["a scheme-relative URL with an encoded slash", "/%2fevil.example.com"],
    ["an encoded backslash", "/%5Cevil.example.com"],
    ["a javascript: URL", "javascript:alert(1)"],
    ["a bare host", "evil.example.com"],
    ["an empty string", ""],
    ["a newline injection", "/appointments\nSet-Cookie: x=1"],
    ["a null byte", "/appointments\u0000.evil"],
  ])("rejects %s", (_label, value) => {
    expect(sanitizeReturnTo(value)).toBeNull();
  });

  it("keeps an ordinary percent-encoded query value", () => {
    expect(sanitizeReturnTo("/services?q=hair%20cut")).toBe(
      "/services?q=hair%20cut",
    );
  });

  it.each([[undefined], [null], [42], [{}], [["/appointments"]]])(
    "rejects the non-string %s",
    (value) => {
      expect(sanitizeReturnTo(value)).toBeNull();
    },
  );
});

describe("authFallbackRedirectUrl", () => {
  it("falls back to the bare redirect route when there is no return target", () => {
    expect(authFallbackRedirectUrl()).toBe(AUTH_REDIRECT_PATH);
    expect(authFallbackRedirectUrl("https://evil.example.com")).toBe(
      AUTH_REDIRECT_PATH,
    );
  });

  it("carries the path and query through our own redirect route", () => {
    expect(authFallbackRedirectUrl("/appointments?serviceId=3")).toBe(
      "/auth/redirect?returnTo=%2Fappointments%3FserviceId%3D3",
    );
  });

  it("never hands Clerk a caller-supplied URL directly", () => {
    const url = authFallbackRedirectUrl("/appointments?serviceId=3");
    expect(url.startsWith(AUTH_REDIRECT_PATH)).toBe(true);
    expect(new URL(url, "https://app.test").pathname).toBe(AUTH_REDIRECT_PATH);
  });
});

describe("route defaults", () => {
  it("sends customers to the appointments page by default", () => {
    expect(DEFAULT_RETURN_PATH).toBe("/appointments");
  });
});
