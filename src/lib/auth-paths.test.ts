import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EMAIL_VERIFIED_EXACT,
  EMAIL_VERIFIED_REQUIRED,
  POST_LOGIN_PATH,
  PROTECTED_EXACT,
  PROTECTED_PATHS,
  pathMatches,
  safeInternalPath,
  signedInPathRedirect,
} from "./auth-paths.ts";

describe("auth paths — the gate for /today", () => {
  it("protects /rivers/mine and leaves /today reachable signed out", () => {
    assert.ok(!(PROTECTED_PATHS as readonly string[]).includes("/today"));
    assert.ok((PROTECTED_EXACT as readonly string[]).includes("/rivers/mine"));
    assert.equal(pathMatches("/today", PROTECTED_PATHS, PROTECTED_EXACT), false);
    assert.equal(pathMatches("/rivers/mine", PROTECTED_PATHS, PROTECTED_EXACT), true);
    assert.equal(pathMatches("/rivers/mine/edit", PROTECTED_PATHS, PROTECTED_EXACT), true);
    assert.equal(pathMatches("/rivers/minnesota", PROTECTED_PATHS, PROTECTED_EXACT), false);
    assert.equal(pathMatches("/rivers/madison-river", PROTECTED_PATHS, PROTECTED_EXACT), false);
  });

  it("lands signed-in users on /today, never bounces public /", () => {
    assert.equal(POST_LOGIN_PATH, "/today");
    assert.equal(signedInPathRedirect("/dashboard"), "/today");
    assert.equal(signedInPathRedirect("/"), null);
    assert.equal(pathMatches("/", PROTECTED_PATHS, PROTECTED_EXACT), false);
  });

  it("leaves the public trip brief ungated", () => {
    assert.equal(pathMatches("/plan", PROTECTED_PATHS, PROTECTED_EXACT), false);
    assert.equal(pathMatches("/plan/madison-river", PROTECTED_PATHS, PROTECTED_EXACT), false);
    assert.equal(
      pathMatches("/plan/madison-river", EMAIL_VERIFIED_REQUIRED, EMAIL_VERIFIED_EXACT),
      false,
    );
  });

  it("rejects protocol-relative and backslash open redirects", () => {
    assert.equal(safeInternalPath("/journal"), "/journal");
    assert.equal(safeInternalPath("/flies/pheasant-tail?from=home"), "/flies/pheasant-tail?from=home");
    assert.equal(safeInternalPath("//evil.com"), null);
    assert.equal(safeInternalPath("/\\evil.com"), null);
    assert.equal(safeInternalPath("/%5C%5Cevil.com"), null);
    assert.equal(safeInternalPath("/%2F%2Fevil.com"), null);
    assert.equal(safeInternalPath("https://evil.com"), null);
    assert.equal(safeInternalPath("journal"), null);
    assert.equal(safeInternalPath(""), null);
    assert.equal(safeInternalPath(null), null);
  });

  it("requires a verified email on /today and /rivers/mine", () => {
    assert.ok((EMAIL_VERIFIED_REQUIRED as readonly string[]).includes("/today"));
    assert.equal(pathMatches("/today", EMAIL_VERIFIED_REQUIRED, PROTECTED_EXACT), true);
    assert.equal(pathMatches("/rivers/mine", EMAIL_VERIFIED_REQUIRED, PROTECTED_EXACT), true);
  });
});
