import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { computeTierHint, globToRegExp, matchesAny, scanRedFlags } from "../scripts/lib/core.mjs";

test("glob: ** crosses segments", () => {
  assert.ok(globToRegExp("src/**").test("src/a/b/c.ts"));
  assert.ok(globToRegExp("src/**").test("src/a.ts"));
  assert.ok(!globToRegExp("src/**").test("tests/a.ts"));
});

test("glob: **/ prefix matches root-level files too", () => {
  assert.ok(globToRegExp("**/*.ts").test("a.ts"));
  assert.ok(globToRegExp("**/*.ts").test("deep/nested/a.ts"));
  assert.ok(!globToRegExp("**/*.ts").test("a.tsx"));
});

test("glob: * stays within a segment", () => {
  assert.ok(globToRegExp("src/*.ts").test("src/a.ts"));
  assert.ok(!globToRegExp("src/*.ts").test("src/nested/a.ts"));
});

test("glob: {a,b} alternation", () => {
  const regex = globToRegExp("**/*.{ts,tsx}");
  assert.ok(regex.test("src/a.ts"));
  assert.ok(regex.test("src/a.tsx"));
  assert.ok(!regex.test("src/a.css"));
});

test("glob: literal dots are escaped", () => {
  assert.ok(!globToRegExp("*.ts").test("ats")); // "." must not act as regex any-char
});

test("glob: * inside {} alternatives works and never throws", () => {
  const regex = globToRegExp("{*.ts,*.tsx}");
  assert.ok(regex.test("a.ts"));
  assert.ok(regex.test("b.tsx"));
  assert.ok(!regex.test("a.css"));
  assert.ok(!globToRegExp("src/{util*,lib}/x.ts").test("src/uti/x.ts"));
  assert.ok(globToRegExp("src/{util*,lib}/x.ts").test("src/utilities/x.ts"));
});

test("matchesAny unions globs", () => {
  assert.ok(matchesAny("package.json", ["src/**", "package.json"]));
  assert.ok(!matchesAny("README.md", ["src/**", "package.json"]));
});

test("scanRedFlags catches multi-line empty catch and reports its line", () => {
  const root = mkdtempSync(join(tmpdir(), "llm-workflow-flags-"));
  try {
    mkdirSync(join(root, "src"));
    writeFileSync(
      join(root, "src/a.ts"),
      ["const x = 1;", "try {", "  f();", "} catch (e) {", "}", "console.log(x);"].join("\n"),
    );
    const findings = scanRedFlags(["src/a.ts"], {}, root);
    const ids = findings.map((finding) => finding.id).sort();
    assert.deepEqual(ids, ["console-log", "empty-catch"]);
    assert.equal(findings.find((finding) => finding.id === "empty-catch").line, 4);
    assert.equal(findings.find((finding) => finding.id === "console-log").line, 6);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("computeTierHint: narrow low-risk diff has no signals on either axis", () => {
  const hint = computeTierHint(["src/views/a.tsx"], ["correctness", "product"]);
  assert.equal(hint.profile, "low");
  assert.deepEqual(hint.radius, []);
  assert.deepEqual(hint.size, []);
});

test("computeTierHint: risk lenses are radius signals — small risky diffs profile medium", () => {
  assert.equal(computeTierHint(["src/auth/a.ts"], ["correctness", "security"]).profile, "medium");
  const hint = computeTierHint(["scripts/x.mjs"], ["correctness", "complexity"]);
  assert.equal(hint.profile, "medium");
  assert.ok(hint.radius[0].includes("complexity"));
  assert.deepEqual(hint.size, []);
});

test("computeTierHint: file count is a size signal; radius + size profiles high", () => {
  const files = ["a", "b", "c", "d", "e", "f"];
  const wideOnly = computeTierHint(files, ["correctness"]);
  assert.equal(wideOnly.profile, "medium");
  assert.deepEqual(wideOnly.size, ["6 files"]);
  assert.deepEqual(wideOnly.radius, []);
  assert.equal(computeTierHint(files.slice(0, 5), ["correctness"]).profile, "low");
  assert.equal(computeTierHint(files, ["correctness", "security"]).profile, "high");
});
