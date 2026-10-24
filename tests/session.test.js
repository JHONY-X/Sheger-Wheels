import { beforeEach, describe, expect, it } from "vitest";
import {
  getSession,
  safeReturnPath,
  signInAsDemo,
  signOut,
} from "../lib/session.js";
import { resetApp } from "./helpers.js";

beforeEach(() => {
  resetApp();
});

describe("safeReturnPath", () => {
  it("keeps an internal path", () => {
    expect(safeReturnPath("/dashboard")).toBe("/dashboard");
    expect(safeReturnPath("/owner/cars?tab=active")).toBe("/owner/cars?tab=active");
  });

  it("rejects absolute URLs", () => {
    expect(safeReturnPath("https://example.com")).toBe("/dashboard");
    expect(safeReturnPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("rejects protocol-relative and backslash tricks", () => {
    expect(safeReturnPath("//evil.example")).toBe("/dashboard");
    expect(safeReturnPath("/\\evil.example")).toBe("/dashboard");
    expect(safeReturnPath("/\tevil")).toBe("/dashboard");
  });

  it("falls back for empty or non-string values", () => {
    expect(safeReturnPath(null)).toBe("/dashboard");
    expect(safeReturnPath(undefined)).toBe("/dashboard");
    expect(safeReturnPath(42)).toBe("/dashboard");
    expect(safeReturnPath("", "/cars")).toBe("/cars");
  });
});

describe("demo session", () => {
  it("signs in by id and stores only the user id", () => {
    const result = signInAsDemo("usr_dawit");
    expect(result.ok).toBe(true);
    expect(getSession().userId).toBe("usr_dawit");
    expect(JSON.stringify(getSession())).not.toMatch(/password/i);
  });

  it("refuses an unknown account", () => {
    expect(signInAsDemo("usr_missing").ok).toBe(false);
  });

  it("clears the session on sign out", () => {
    signInAsDemo("usr_dawit");
    signOut();
    expect(getSession()).toBeNull();
  });
});
